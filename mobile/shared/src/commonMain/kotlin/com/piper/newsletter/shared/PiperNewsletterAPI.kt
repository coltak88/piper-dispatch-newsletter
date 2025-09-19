package com.piper.newsletter.shared

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.auth.*
import io.ktor.client.plugins.auth.providers.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

class PiperNewsletterAPI(
    private val baseUrl: String = "https://api.pipernewsletter.com",
    private val authManager: AuthManager
) {
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        prettyPrint = true
    }
    
    val client = HttpClient {
        install(ContentNegotiation) {
            json(json)
        }
        install(Logging) {
            level = LogLevel.INFO
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 30000
            connectTimeoutMillis = 10000
            socketTimeoutMillis = 30000
        }
        install(Auth) {
            bearer {
                loadTokens {
                    val token = authManager.getCurrentToken()
                    if (token != null) {
                        BearerTokens(token.accessToken, token.refreshToken)
                    } else {
                        null
                    }
                }
                refreshTokens {
                    val token = authManager.refreshToken()
                    if (token != null) {
                        BearerTokens(token.accessToken, token.refreshToken)
                    } else {
                        null
                    }
                }
                sendWithoutRequest { request ->
                    request.url.host == "api.pipernewsletter.com"
                }
            }
        }
        
        defaultRequest {
            url(baseUrl)
            contentType(ContentType.Application.Json)
            accept(ContentType.Application.Json)
        }
    }
    
    suspend inline fun <reified T> get(
        endpoint: String,
        block: HttpRequestBuilder.() -> Unit = {}
    ): T {
        return client.get(endpoint) {
            block()
        }.body()
    }
    
    suspend inline fun <reified T> post(
        endpoint: String,
        body: Any? = null,
        block: HttpRequestBuilder.() -> Unit = {}
    ): T {
        return client.post(endpoint) {
            if (body != null) {
                setBody(body)
            }
            block()
        }.body()
    }
    
    suspend inline fun <reified T> put(
        endpoint: String,
        body: Any? = null,
        block: HttpRequestBuilder.() -> Unit = {}
    ): T {
        return client.put(endpoint) {
            if (body != null) {
                setBody(body)
            }
            block()
        }.body()
    }
    
    suspend inline fun <reified T> delete(
        endpoint: String,
        block: HttpRequestBuilder.() -> Unit = {}
    ): T {
        return client.delete(endpoint) {
            block()
        }.body()
    }
    
    suspend fun healthCheck(): Boolean {
        return try {
            val response: Map<String, String> = get("/health")
            response["status"] == "ok"
        } catch (e: Exception) {
            false
        }
    }
}