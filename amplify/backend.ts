import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource'; // ✅ fixed import
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';

/**
 * Amplify backend assembly:
 * - Cognito User Pools for auth
 * - AppSync GraphQL API with a custom HTTP data source
 *   signed for Bedrock (us-east-1)
 */
const backend = defineBackend({ auth, data });

const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
    'bedrockDS',
    'https://bedrock-runtime.us-east-1.amazonaws.com',
    {
        authorizationConfig: {
            signingRegion: 'us-east-1',
            signingServiceName: 'bedrock',
        },
    },
);

// IAM permission for this data source to invoke Claude 3 Sonnet.
bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
    new PolicyStatement({
        resources: [
            'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',
        ],
        actions: ['bedrock:InvokeModel'],
    }),
);
