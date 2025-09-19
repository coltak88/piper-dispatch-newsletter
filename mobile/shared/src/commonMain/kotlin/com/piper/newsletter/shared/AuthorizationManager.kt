package com.piper.newsletter.shared

import kotlinx.serialization.Serializable

@Serializable
data class Permission(
    val name: String,
    val description: String,
    val resource: String,
    val action: String
)

@Serializable
data class Role(
    val name: String,
    val permissions: List<Permission>,
    val description: String
)

@Serializable
data class AuthorizationContext(
    val user: User?,
    val token: String?,
    val permissions: List<Permission>,
    val roles: List<String>
) {
    fun hasPermission(permission: String): Boolean {
        return permissions.any { it.name == permission }
    }
    
    fun hasRole(role: String): Boolean {
        return roles.contains(role)
    }
    
    fun canAccess(resource: String, action: String): Boolean {
        return permissions.any { it.resource == resource && it.action == action }
    }
}

class AuthorizationManager {
    companion object {
        // Predefined roles and permissions
        val ADMIN_ROLE = Role(
            name = "admin",
            description = "Administrator with full access",
            permissions = listOf(
                Permission("users.create", "Create users", "users", "create"),
                Permission("users.read", "Read users", "users", "read"),
                Permission("users.update", "Update users", "users", "update"),
                Permission("users.delete", "Delete users", "users", "delete"),
                Permission("newsletters.create", "Create newsletters", "newsletters", "create"),
                Permission("newsletters.read", "Read newsletters", "newsletters", "read"),
                Permission("newsletters.update", "Update newsletters", "newsletters", "update"),
                Permission("newsletters.delete", "Delete newsletters", "newsletters", "delete"),
                Permission("analytics.read", "Read analytics", "analytics", "read"),
                Permission("subscriptions.manage", "Manage subscriptions", "subscriptions", "manage"),
                Permission("settings.manage", "Manage settings", "settings", "manage")
            )
        )
        
        val EDITOR_ROLE = Role(
            name = "editor",
            description = "Editor with content management access",
            permissions = listOf(
                Permission("newsletters.create", "Create newsletters", "newsletters", "create"),
                Permission("newsletters.read", "Read newsletters", "newsletters", "read"),
                Permission("newsletters.update", "Update newsletters", "newsletters", "update"),
                Permission("analytics.read", "Read analytics", "analytics", "read"),
                Permission("subscriptions.read", "Read subscriptions", "subscriptions", "read")
            )
        )
        
        val VIEWER_ROLE = Role(
            name = "viewer",
            description = "Viewer with read-only access",
            permissions = listOf(
                Permission("newsletters.read", "Read newsletters", "newsletters", "read"),
                Permission("subscriptions.read", "Read subscriptions", "subscriptions", "read"),
                Permission("analytics.read", "Read analytics", "analytics", "read")
            )
        )
        
        val ALL_ROLES = listOf(ADMIN_ROLE, EDITOR_ROLE, VIEWER_ROLE)
        
        fun getRoleByName(name: String): Role? {
            return ALL_ROLES.find { it.name == name }
        }
        
        fun getPermissionsForRoles(roleNames: List<String>): List<Permission> {
            return roleNames.mapNotNull { roleName ->
                getRoleByName(roleName)?.permissions
            }.flatten().distinctBy { it.name }
        }
    }
    
    fun createAuthorizationContext(user: User?, token: String?): AuthorizationContext {
        val roles = if (user != null) {
            listOfNotNull(user.role)
        } else {
            emptyList()
        }
        
        val permissions = getPermissionsForRoles(roles)
        
        return AuthorizationContext(
            user = user,
            token = token,
            permissions = permissions,
            roles = roles
        )
    }
    
    fun validateAccess(
        context: AuthorizationContext,
        resource: String,
        action: String,
        requireAuthentication: Boolean = true
    ): Boolean {
        if (requireAuthentication && context.user == null) {
            return false
        }
        
        return context.canAccess(resource, action)
    }
    
    fun validatePermission(
        context: AuthorizationContext,
        permission: String,
        requireAuthentication: Boolean = true
    ): Boolean {
        if (requireAuthentication && context.user == null) {
            return false
        }
        
        return context.hasPermission(permission)
    }
}