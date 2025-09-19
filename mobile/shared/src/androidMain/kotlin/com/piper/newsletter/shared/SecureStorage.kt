package com.piper.newsletter.shared

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

actual class SecureStorage(private val context: Context) {
    private val sharedPreferences: SharedPreferences by lazy {
        context.getSharedPreferences("piper_newsletter_auth", Context.MODE_PRIVATE)
    }
    
    private val json = Json { 
        ignoreUnknownKeys = true
        isLenient = true
    }
    
    actual suspend fun saveToken(token: AuthToken) = withContext(Dispatchers.IO) {
        val tokenJson = json.encodeToString(token)
        sharedPreferences.edit()
            .putString("auth_token", tokenJson)
            .apply()
    }
    
    actual suspend fun getToken(): AuthToken? = withContext(Dispatchers.IO) {
        val tokenJson = sharedPreferences.getString("auth_token", null) ?: return@withContext null
        try {
            json.decodeFromString<AuthToken>(tokenJson)
        } catch (e: Exception) {
            null
        }
    }
    
    actual suspend fun clearToken() = withContext(Dispatchers.IO) {
        sharedPreferences.edit()
            .remove("auth_token")
            .apply()
    }
    
    actual suspend fun saveUser(user: User) = withContext(Dispatchers.IO) {
        val userJson = json.encodeToString(user)
        sharedPreferences.edit()
            .putString("current_user", userJson)
            .apply()
    }
    
    actual suspend fun getUser(): User? = withContext(Dispatchers.IO) {
        val userJson = sharedPreferences.getString("current_user", null) ?: return@withContext null
        try {
            json.decodeFromString<User>(userJson)
        } catch (e: Exception) {
            null
        }
    }
    
    actual suspend fun clearUser() = withContext(Dispatchers.IO) {
        sharedPreferences.edit()
            .remove("current_user")
            .apply()
    }
}