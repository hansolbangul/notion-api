import { NotionAPI } from 'notion-client';
import { idToUuid, getTextContent, getDateValue } from 'notion-utils';
import {
  BlockMap,
  CollectionPropertySchemaMap,
  ExtendedRecordMap,
  ID,
} from 'notion-types';

type TPosts = any;

interface NotionConfig {
  pageId: string;
}

class NotionApiService {
  private api: NotionAPI;
  private config: NotionConfig;

  constructor(config: NotionConfig) {
    this.api = new NotionAPI();
    this.config = config;
  }

  private async fetchPage(pageId: string) {
    return await this.api.getPage(pageId);
  }

  /**
   * Get all page IDs from a Notion response
   * @param response - ExtendedRecordMap from Notion API
   * @param viewId - Optional viewId for filtering
   */
  private getAllPageIds(response: ExtendedRecordMap, viewId?: string): ID[] {
    const collectionQuery = response.collection_query;
    const views = Object.values(collectionQuery)[0];

    let pageIds: ID[] = [];
    if (viewId) {
      const vId = idToUuid(viewId);
      pageIds = views[vId]?.blockIds || [];
    } else {
      const pageSet = new Set<ID>();
      Object.values(views).forEach((view: any) => {
        view?.collection_group_results?.blockIds?.forEach((id: ID) =>
          pageSet.add(id)
        );
      });
      pageIds = Array.from(pageSet);
    }
    return pageIds;
  }

  private async extractPageProperties(
    pageId: string,
    block: BlockMap,
    schema: CollectionPropertySchemaMap
  ): Promise<Record<string, any>> {
    const rawProperties: [string, any][] = Object.entries(
      block?.[pageId]?.value?.properties || {}
    );
    const properties: Record<string, any> = { id: pageId };

    for (const [key, value] of rawProperties) {
      const fieldSchema = schema[key];

      if (!fieldSchema) continue;

      switch (fieldSchema.type) {
        case 'title':
        case 'text':
        case 'email':
        case 'url':
          properties[fieldSchema.name] = getTextContent(value);
          break;

        case 'date':
          properties[fieldSchema.name] = getDateValue(value);
          break;

        case 'file': {
          const files = value.map((file: any) => ({
            name: file[0],
            url: file[1]?.[0]?.[1],
          }));
          properties[fieldSchema.name] = files;
          break;
        }

        case 'person': {
          const rawUsers = value.flat();
          const users = await Promise.all(
            rawUsers.map(async (user: any) => {
              const userId = user?.[0][1];
              if (!userId) {
                return null;
              }

              try {
                const userDetails: any = await this.api.getUsers([userId]);
                const userRecord =
                  userDetails?.recordMapWithRoles?.notion_user?.[userId]?.value;

                return {
                  id: userId,
                  name:
                    userRecord?.name ||
                    `${userRecord?.family_name ?? ''} ${
                      userRecord?.given_name ?? ''
                    }`.trim() ||
                    'Unknown',
                  profile_photo: userRecord?.profile_photo || null,
                };
              } catch (error) {
                console.error(
                  `Failed to fetch user details for userId: ${userId}`,
                  error
                );
                return null;
              }
            })
          );
          properties[fieldSchema.name] = users.filter((user) => user !== null);
          break;
        }

        case 'select':
        case 'multi_select': {
          const selections = getTextContent(value);
          properties[fieldSchema.name] = selections
            ? selections.split(',')
            : [];
          break;
        }

        default:
          properties[fieldSchema.name] = getTextContent(value);
      }
    }

    return properties;
  }

  public async getPosts(
    includePages = false,
    viewId?: string
  ): Promise<TPosts> {
    let id = this.config.pageId;
    id = idToUuid(id);

    const recordMap = await this.fetchPage(id);
    const collection = Object.values(recordMap.collection)[0]?.value;
    const block: BlockMap = recordMap.block;
    const schema: CollectionPropertySchemaMap = collection?.schema;

    if (!schema) {
      throw new Error('Schema not found in the given Notion page.');
    }

    const rawMetadata = block[id]?.value;

    if (
      rawMetadata?.type !== 'collection_view_page' &&
      rawMetadata?.type !== 'collection_view'
    ) {
      return [];
    }

    const pageIds = this.getAllPageIds(recordMap, viewId);

    const posts = await Promise.all(
      pageIds.map(async (pageId) => {
        const [properties, postBlock] = await Promise.all([
          this.extractPageProperties(pageId, block, schema),
          this.fetchPage(pageId),
        ]);

        const blockValue: any = block[pageId]?.value;
        if (blockValue) {
          properties.createdTime = new Date(
            blockValue?.created_time
          ).toISOString();
          properties.fullWidth = blockValue?.format?.page_full_width || false;
        }

        properties.block = postBlock;

        return properties;
      })
    );

    const validPosts = posts.filter(
      (post) => post.title && (includePages || post.type !== 'page')
    );

    console.log('validPosts', validPosts);

    return validPosts;
  }
}

export default NotionApiService;
