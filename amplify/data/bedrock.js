/**
 * Custom HTTP resolver handler for invoking Amazon Bedrock (Claude 3 Sonnet).
 * This file runs in the AppSync/Amplify runtime and returns a simplified shape.
 *
 * Expected args:
 * - ctx.args.ingredients: string[] of ingredients
 *
 * Returns:
 * - { body: string } where body is the model's textual response
 */
export function request(ctx) {
    const { ingredients = [] } = ctx.args;
    const clean = Array.isArray(ingredients)
        ? ingredients.filter(Boolean).map((s) => String(s).trim()).filter(Boolean)
        : [];

    const prompt = clean.length
        ? `Suggest a creative recipe idea using ONLY these ingredients where possible: ${clean.join(', ')}.`
        : 'Suggest a simple, budget-friendly recipe idea.';

    return {
        resourcePath:
            '/model/anthropic.claude-3-sonnet-20240229-v1:0/invoke',
        method: 'POST',
        params: {
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `\n\nHuman: ${prompt}\n\nAssistant:`,
                            },
                        ],
                    },
                ],
            }),
        },
    };
}

/**
 * Shapes Bedrock's raw response into { body: string }.
 * Includes guards for unexpected payloads so the UI stays resilient.
 */
export function response(ctx) {
    try {
        const parsed = JSON.parse(ctx.result.body);
        const text =
            parsed?.content?.[0]?.text ??
            parsed?.output_text ?? // alternate field sometimes used
            'No content returned by the model.';

        return { body: text };
    } catch {
        return { body: 'Failed to parse Bedrock response.' };
    }
}
