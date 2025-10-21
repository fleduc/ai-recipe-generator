import { type FormEvent, useCallback, useMemo, useState } from 'react';
import { Loader, Placeholder } from '@aws-amplify/ui-react';
import './App.css';
import { Amplify } from 'aws-amplify';
import type { Schema } from '../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

// We explicitly use the User Pool auth mode because the query requires authentication.
const amplifyClient = generateClient<Schema>({ authMode: 'userPool' });

/**
 * Top-level application component for the AI Recipe Generator demo.
 * - Provides a simple form to submit a comma-separated ingredient list.
 * - Calls the GraphQL query `askBedrock` via Amplify Data.
 * - Displays model output and basic loading/error states.
 */
function App() {
    const [result, setResult] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const placeholder = useMemo(
        () => 'Ingredient1, Ingredient2, Ingredient3, ...',
        [],
    );

    const onSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setLoading(true);
            setError('');
            setResult('');

            try {
                const formData = new FormData(event.currentTarget);
                const raw = formData.get('ingredients')?.toString() ?? '';

                // Convert "x, y, z" into ["x","y","z"] (trimmed, no empties)
                const ingredients = raw
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);

                const { data, errors } = await amplifyClient.queries.askBedrock({
                    ingredients,
                });

                if (errors && errors.length) {
                    console.error(errors);
                    setError('The API returned an error. Check the console for details.');
                    return;
                }

                setResult(data?.body || 'No data returned.');
            } catch (e: unknown) {
                console.error(e);
                setError('An unexpected error occurred while generating a recipe.');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return (
        <div className="app-container">
            <div className="header-container">
                <h1 className="main-header">
                    Meet Your Personal <br />
                    <span className="highlight">Recipe AI</span>
                </h1>
                <p className="description">
                    Type a few ingredients separated by commas and Recipe AI will generate
                    a complete recipe on demand.
                </p>
            </div>

            <form onSubmit={onSubmit} className="form-container">
                <div className="search-container">
                    <input
                        type="text"
                        className="wide-input"
                        id="ingredients"
                        name="ingredients"
                        placeholder={placeholder}
                        autoComplete="off"
                        required
                        aria-label="List of ingredients"
                    />
                    <button type="submit" className="search-button" disabled={loading}>
                        {loading ? 'Generating…' : 'Generate'}
                    </button>
                </div>
            </form>

            <div className="result-container">
                {loading ? (
                    <div className="loader-container">
                        <p>Loading…</p>
                        <Loader size="large" />
                        <Placeholder size="large" />
                        <Placeholder size="large" />
                        <Placeholder size="large" />
                    </div>
                ) : error ? (
                    <p className="result" role="alert">
                        {error}
                    </p>
                ) : (
                    result && <p className="result">{result}</p>
                )}
            </div>
        </div>
    );
}

export default App;
