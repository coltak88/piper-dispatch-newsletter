package com.piper.newsletter.android.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.piper.newsletter.android.ui.screens.LoginScreen
import com.piper.newsletter.android.ui.screens.HomeScreen
import com.piper.newsletter.android.ui.screens.NewsletterDetailScreen
import com.piper.newsletter.android.ui.screens.ProfileScreen
import com.piper.newsletter.android.ui.screens.AnalyticsScreen

@Composable
fun AppNavigation(navController: NavHostController = rememberNavController()) {
    NavHost(
        navController = navController,
        startDestination = "login"
    ) {
        composable("login") {
            LoginScreen(
                onLoginSuccess = { navController.navigate("home") }
            )
        }
        
        composable("home") {
            HomeScreen(
                onNewsletterClick = { newsletterId ->
                    navController.navigate("newsletter/$newsletterId")
                },
                onProfileClick = { navController.navigate("profile") },
                onAnalyticsClick = { navController.navigate("analytics") }
            )
        }
        
        composable("newsletter/{newsletterId}") { backStackEntry ->
            val newsletterId = backStackEntry.arguments?.getString("newsletterId") ?: ""
            NewsletterDetailScreen(
                newsletterId = newsletterId,
                onBackClick = { navController.popBackStack() }
            )
        }
        
        composable("profile") {
            ProfileScreen(
                onBackClick = { navController.popBackStack() }
            )
        }
        
        composable("analytics") {
            AnalyticsScreen(
                onBackClick = { navController.popBackStack() }
            )
        }
    }
}