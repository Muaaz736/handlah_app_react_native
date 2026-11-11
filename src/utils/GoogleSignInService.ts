// services/GoogleSignInService.js
import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';

interface UserInfo {
    id: string;
    name: string;
    email: string;
    photo: string;
    familyName: string;
    givenName: string;
}

interface SignInResponse {
    success: boolean;
    user: UserInfo;
    idToken: string;
    givenName: string; 
    familyName: string;
    serverAuthCode: string;
}

interface SignOutResponse {
    success: boolean;
    error?: string;
}

interface TokenResponse {
    success: boolean;
    accessToken?: string;
    idToken?: string;
    error?: string;
}

interface ErrorResponse {
    success: false;
    error: string;
    errorCode?: string;
}

class GoogleSignInService {
    configured: boolean;

    constructor() {
        this.configured = false;
    }

    /**
     * Configure Google Sign-In
     * @param {string} webClientId - Web Client ID from Google Cloud Console
     * @param {string} iosClientId - iOS Client ID (optional, only for iOS)
     */
    configure(webClientId: string | null = null, iosClientId: string | null = null, androidClientId: string | null = null): void {
        if (this.configured) return;

        const config: any = {
            webClientId: webClientId,
            offlineAccess: true,
            forceCodeForRefreshToken: true,
            scopes: ['profile', 'email'],
        };

        if (androidClientId) {
            config.androidClientId = androidClientId;
        }

        if (iosClientId) {
            config.iosClientId = iosClientId;
        }

        GoogleSignin.configure(config);
        this.configured = true;
    }

    /**
     * Sign in with Google
     * @returns {Promise<Object>} User info or error
     */
    async signIn(): Promise<SignInResponse | ErrorResponse> {
        try {
            // Check if Play Services are available (Android)
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Sign in
            const userInfo = await GoogleSignin.signIn();
            return {
                success: !!userInfo?.data,
                user: {
                    id: userInfo?.data?.user?.id,
                    name: userInfo?.data?.user?.name,
                    email: userInfo?.data?.user?.email,
                    photo: userInfo?.data?.user?.photo,
                    familyName: userInfo?.data?.user?.familyName,
                    givenName: userInfo?.data?.user?.givenName,
                },
                idToken: userInfo?.data?.idToken,
                serverAuthCode: userInfo?.data?.serverAuthCode,
            } as SignInResponse;
        } catch (error) {
            return this.handleError(error as Error);
        }
    }

    /**
     * Sign out from Google
     * @returns {Promise<Object>} Success or error
     */
    async signOut(): Promise<SignOutResponse> {
        try {
            await GoogleSignin.revokeAccess(); // Remove user data
            await GoogleSignin.signOut(); // Sign out
            return { success: true };
        } catch (error) {
            console.error('Sign Out Error:', error);
            return {
                success: false,
                error: 'Failed to sign out',
            };
        }
    }

    /**
     * Get current signed in user (silent sign-in)
     * @returns {Promise<Object|null>} User info or null
     */
    async getCurrentUser(): Promise<UserInfo | null> {
        try {
            const userInfo = await GoogleSignin.signInSilently();
            return {
                id: userInfo?.data?.user?.id || '',
                name: userInfo?.data?.user?.name || '',
                email: userInfo?.data?.user?.email || '',
                photo: userInfo?.data?.user?.photo || '',
                familyName: userInfo?.data?.user?.familyName || '',
                givenName: userInfo?.data?.user?.givenName || '',
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if user is signed in
     * @returns {Promise<boolean>}
     */
    async isSignedIn(): Promise<boolean> {
        return (await GoogleSignin.getCurrentUser()) !== null;
    }

    /**
     * Get access token
     * @returns {Promise<Object>} Tokens
     */
    async getTokens(): Promise<TokenResponse> {
        try {
            const tokens = await GoogleSignin.getTokens();
            return {
                success: true,
                accessToken: tokens.accessToken,
                idToken: tokens.idToken,
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to get tokens',
            };
        }
    }

    /**
     * Handle errors
     * @param {Error} error
     * @returns {Object}
     */
    handleError(error: Error): ErrorResponse {
        console.error('Google Sign-In Error:', error);

        let errorMessage = 'An unknown error occurred';

        if ((error as any).code === statusCodes.SIGN_IN_CANCELLED) {
            errorMessage = 'Sign in was cancelled';
        } else if ((error as any).code === statusCodes.IN_PROGRESS) {
            errorMessage = 'Sign in is already in progress';
        } else if ((error as any).code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            errorMessage = 'Play Services not available or outdated';
        } else {
            errorMessage = error.message || 'Sign in failed';
        }

        return {
            success: false,
            error: errorMessage,
            errorCode: (error as any).code,
        };
    }
}

export default new GoogleSignInService();
