import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * GraphQL schema:
 * - askBedrock(ingredients: [String!]!): BedrockResponse
 *   Auth: authenticated users only (Cognito User Pools)
 *
 * Note:
 * defaultAuthorizationMode is API key (for public types if you add some later),
 * but this field requires authentication explicitly.
 */
const schema = a.schema({
    BedrockResponse: a.customType({
        body: a.string(),
        // Marked optional because the handler doesn’t return it today.
        error: a.string(),
    }),
    askBedrock: a
        .query()
        .arguments({ ingredients: a.string().array() })
        .returns(a.ref('BedrockResponse'))
        .authorization((allow) => [allow.authenticated()])
        .handler(
            a.handler.custom({
                entry: './bedrock.js',
                dataSource: 'bedrockDS',
            }),
        ),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        // Keep API key for future public fields/components if needed.
        defaultAuthorizationMode: 'apiKey',
        apiKeyAuthorizationMode: { expiresInDays: 30 },
    },
});
