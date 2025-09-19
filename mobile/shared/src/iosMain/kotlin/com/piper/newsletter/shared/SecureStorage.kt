package com.piper.newsletter.shared

import kotlinx.cinterop.ExperimentalForeignApi
import platform.Foundation.*

@OptIn(ExperimentalForeignApi::class)
actual class SecureStorage {
    private val keychain = NSUserDefaults.standardUserDefaults
    
    actual suspend fun saveToken(token: AuthToken) {
        val data = NSKeyedArchiver.archivedDataWithRootObject(
            mapOf(
                "accessToken" to token.accessToken,
                "refreshToken" to token.refreshToken,
                "expiresIn" to token.expiresIn,
                "tokenType" to token.tokenType
            )
        )
        keychain.setObject(data, "auth_token")
    }
    
    actual suspend fun getToken(): AuthToken? {
        val data = keychain.objectForKey("auth_token") as? NSData ?: return null
        
        @Suppress("UNCHECKED_CAST")
        val dict = NSKeyedUnarchiver.unarchiveObjectWithData(data) as? Map<String, Any> ?: return null
        
        return AuthToken(
            accessToken = dict["accessToken"] as? String ?: return null,
            refreshToken = dict["refreshToken"] as? String ?: return null,
            expiresIn = (dict["expiresIn"] as? NSNumber)?.longValue ?: return null,
            tokenType = dict["tokenType"] as? String ?: "Bearer"
        )
    }
    
    actual suspend fun clearToken() {
        keychain.removeObjectForKey("auth_token")
    }
    
    actual suspend fun saveUser(user: User) {
        val data = NSKeyedArchiver.archivedDataWithRootObject(
            mapOf(
                "id" to user.id,
                "email" to user.email,
                "name" to user.name,
                "role" to user.role,
                "avatar" to user.avatar,
                "createdAt" to user.createdAt,
                "updatedAt" to user.updatedAt
            )
        )
        keychain.setObject(data, "current_user")
    }
    
    actual suspend fun getUser(): User? {
        val data = keychain.objectForKey("current_user") as? NSData ?: return null
        
        @Suppress("UNCHECKED_CAST")
        val dict = NSKeyedUnarchiver.unarchiveObjectWithData(data) as? Map<String, Any> ?: return null
        
        return User(
            id = (dict["id"] as? NSNumber)?.intValue ?: return null,
            email = dict["email"] as? String ?: return null,
            name = dict["name"] as? String ?: return null,
            role = dict["role"] as? String,
            avatar = dict["avatar"] as? String,
            createdAt = dict["createdAt"] as? String,
            updatedAt = dict["updatedAt"] as? String
        )
    }
    
    actual suspend fun clearUser() {
        keychain.removeObjectForKey("current_user")
    }
}