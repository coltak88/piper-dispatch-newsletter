package com.piper.newsletter.android.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.piper.newsletter.shared.AuthManager
import kotlinx.coroutines.launch
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

class LoginViewModel : ViewModel(), KoinComponent {
    private val authManager: AuthManager by inject()
    
    fun login(email: String, password: String, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            try {
                val success = authManager.login(email, password)
                if (success) {
                    onResult(true, null)
                } else {
                    onResult(false, "Invalid email or password")
                }
            } catch (e: Exception) {
                onResult(false, "Login failed: ${e.message}")
            }
        }
    }
}