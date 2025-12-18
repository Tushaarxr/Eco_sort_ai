# API Setup Guide

## Gemini API Configuration

To use the e-waste scanning functionality, you need to configure the Gemini API key.

### Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure the API Key

Create a `.env` file in the root directory of your project:

```bash
# .env
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Test the API

1. Run the app
2. Go to Profile tab
3. Click "Test API Connection"
4. This will verify if your API key is working correctly

### Troubleshooting

If the API test fails:

1. **Check API Key**: Ensure your API key is correct and not expired
2. **Check Permissions**: Make sure your API key has the necessary permissions
3. **Check Quota**: Verify you have sufficient API quota remaining
4. **Check Network**: Ensure you have a stable internet connection

### API Usage

The app uses Gemini API for:
- Image analysis of e-waste items
- Generating disposal guidance
- Identifying materials and hazard levels

### Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Keep your API key secure and don't share it publicly

## Firebase Configuration

The app also uses Firebase for:
- User authentication
- Data storage
- Image uploads

Firebase configuration is already set up in `firebase.ts` with the project credentials.
