package com.piper.newsletter.shared

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable

@Serializable
data class AuthToken(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long,
    val tokenType: String = "Bearer"
)

@Serializable
data class UserCredentials(
    val email: String,
    val password: String
)

@Serializable
data class AuthResponse(
    val success: Boolean,
    val message: String? = null,
    val token: AuthToken? = null,
    val user: User? = null
)

expect class SecureStorage {
    suspend fun saveToken(token: AuthToken)
    suspend fun getToken(): AuthToken?
    suspend fun clearToken()
    suspend fun saveUser(user: User)
    suspend fun getUser(): User?
    suspend fun clearUser()
}

class AuthManager(
    private val apiClient: ApiClient,
    private val secureStorage: SecureStorage
) {
    private val mutex = Mutex()
    private var _currentToken: AuthToken? = null
    private var _currentUser: User? = null
    
    val isAuthenticated: Boolean
        get() = _currentToken != null && !isTokenExpired()
    
    val currentUser: User?
        get() = _currentUser
    
    suspend fun initialize() {
        mutex.withLock {
            _currentToken = secureStorage.getToken()
            _currentUser = secureStorage.getUser()
        }
    }
    
    suspend fun login(email: String, password: String): Boolean {
        return try {
            val credentials = UserCredentials(email, password)
            val response = apiClient.login(credentials)
            
            if (response.success && response.token != null && response.user != null) {
                mutex.withLock {
                    _currentToken = response.token
                    _currentUser = response.user
                    secureStorage.saveToken(response.token)
                    secureStorage.saveUser(response.user)
                }
                true
            } else {
                false
            }
        } catch (e: Exception) {
            println("Login error: ${e.message}")
            false
        }
    }
    
    suspend fun logout() {
        mutex.withLock {
            try {
                apiClient.logout()
            } catch (e: Exception) {
                println("Logout API error: ${e.message}")
            } finally {
                _currentToken = null
                _currentUser = null
                secureStorage.clearToken()
                secureStorage.clearUser()
            }
        }
    }
    
    suspend fun refreshToken(): Boolean {
        return try {
            val refreshToken = _currentToken?.refreshToken ?: return false
            val response = apiClient.refreshToken(refreshToken)
            
            if (response.success && response.token != null) {
                mutex.withLock {
                    _currentToken = response.token
                    secureStorage.saveToken(response.token)
                }
                true
            } else {
                false
            }
        } catch (e: Exception) {
            println("Token refresh error: ${e.message}")
            false
        }
    }
    
    suspend fun getAccessToken(): String? {
        return mutex.withLock {
            if (isTokenExpired()) {
                if (!refreshToken()) {
                    return null
                }
            }
            _currentToken?.accessToken
        }
    }
    
    suspend fun updatePassword(currentPassword: String, newPassword: String): Boolean {
        return try {
            val response = apiClient.updatePassword(currentPassword, newPassword)
            response.success
        } catch (e: Exception) {
            println("Password update error: ${e.message}")
            false
        }
    }
    
    suspend fun resetPassword(email: String): Boolean {
        return try {
            val response = apiClient.resetPassword(email)
            response.success
        } catch (e: Exception) {
            println("Password reset error: ${e.message}")
            false
        }
    }
    
    suspend fun register(name: String, email: String, password: String): Boolean {
        return try {
            val response = apiClient.register(name, email, password)
            response.success
        } catch (e: Exception) {
            println("Registration error: ${e.message}")
            false
        }
    }
    
    private fun isTokenExpired(): Boolean {
        val token = _currentToken ?: return true
        // Simple expiration check - in production, decode JWT token
        val currentTime = currentTimeMillis()
        val expirationTime = token.expiresIn * 1000 // Convert seconds to milliseconds
        return currentTime >= expirationTime
    }
    
    private fun currentTimeMillis(): Long {
        return kotlin.native.currentTimeMillis()
    }
}