package com.piper.newsletter.android.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.piper.newsletter.android.ui.theme.AppSpacing
import com.piper.newsletter.android.ui.theme.AppTypography
import com.piper.newsletter.android.ui.theme.AppColors

@Composable
fun LoadingIndicator(
    modifier: Modifier = Modifier,
    message: String? = null,
    style: LoadingStyle = LoadingStyle.Circular
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(AppSpacing.Medium.dp)
        ) {
            when (style) {
                LoadingStyle.Circular -> {
                    CircularProgressIndicator(
                        color = AppColors.Primary,
                        strokeWidth = 4.dp
                    )
                }
                LoadingStyle.Linear -> {
                    LinearProgressIndicator(
                        color = AppColors.Primary,
                        trackColor = AppColors.Primary.copy(alpha = 0.3f)
                    )
                }
                LoadingStyle.Custom -> {
                    CircularProgressIndicator(
                        color = AppColors.Primary,
                        strokeWidth = 4.dp
                    )
                }
            }
            
            message?.let {
                Text(
                    text = it,
                    style = AppTypography.BodyMedium,
                    color = AppColors.TextSecondary
                )
            }
        }
    }
}

enum class LoadingStyle {
    Circular,
    Linear,
    Custom
}

@Composable
fun ErrorState(
    modifier: Modifier = Modifier,
    title: String = "Something went wrong",
    message: String = "An unexpected error occurred. Please try again.",
    retryTitle: String = "Retry",
    onRetry: () -> Unit
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.padding(horizontal = AppSpacing.Large.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(
                containerColor = AppColors.Surface
            )
        ) {
            Column(
                modifier = Modifier.padding(AppSpacing.Large.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(AppSpacing.Medium.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Error,
                    contentDescription = "Error",
                    tint = AppColors.Error,
                    modifier = Modifier.size(64.dp)
                )
                
                Text(
                    text = title,
                    style = AppTypography.TitleMedium,
                    color = AppColors.TextPrimary,
                    textAlign = TextAlign.Center
                )
                
                Text(
                    text = message,
                    style = AppTypography.BodyMedium,
                    color = AppColors.TextSecondary,
                    textAlign = TextAlign.Center
                )
                
                Button(
                    onClick = onRetry,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AppColors.Error
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Retry",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = retryTitle)
                }
            }
        }
    }
}

@Composable
fun EmptyState(
    modifier: Modifier = Modifier,
    icon: ImageVector = Icons.Default.Inbox,
    title: String = "No data available",
    message: String = "There's nothing to show here right now.",
    actionTitle: String? = null,
    onAction: (() -> Unit)? = null
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.padding(horizontal = AppSpacing.Large.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(
                containerColor = AppColors.Surface
            )
        ) {
            Column(
                modifier = Modifier.padding(AppSpacing.Large.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(AppSpacing.Medium.dp)
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = "Empty",
                    tint = AppColors.TextTertiary,
                    modifier = Modifier.size(64.dp)
                )
                
                Text(
                    text = title,
                    style = AppTypography.TitleMedium,
                    color = AppColors.TextPrimary,
                    textAlign = TextAlign.Center
                )
                
                Text(
                    text = message,
                    style = AppTypography.BodyMedium,
                    color = AppColors.TextSecondary,
                    textAlign = TextAlign.Center
                )
                
                if (actionTitle != null && onAction != null) {
                    Button(
                        onClick = onAction,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AppColors.Primary
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(text = actionTitle)
                    }
                }
            }
        }
    }
}

@Composable
fun AppButton(
    onClick: () -> Unit,
    text: String,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.Primary,
    size: ButtonSize = ButtonSize.Medium,
    enabled: Boolean = true,
    icon: ImageVector? = null
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .height(when (size) {
                ButtonSize.Small -> 32.dp
                ButtonSize.Medium -> 44.dp
                ButtonSize.Large -> 56.dp
            })
            .widthIn(min = when (size) {
                ButtonSize.Small -> 80.dp
                ButtonSize.Medium -> 120.dp
                ButtonSize.Large -> 160.dp
            }),
        colors = when (variant) {
            ButtonVariant.Primary -> ButtonDefaults.buttonColors(
                containerColor = AppColors.Primary,
                contentColor = AppColors.TextInverse,
                disabledContainerColor = AppColors.Primary.copy(alpha = 0.6f),
                disabledContentColor = AppColors.TextInverse.copy(alpha = 0.6f)
            )
            ButtonVariant.Secondary -> ButtonDefaults.buttonColors(
                containerColor = AppColors.Secondary,
                contentColor = AppColors.TextInverse,
                disabledContainerColor = AppColors.Secondary.copy(alpha = 0.6f),
                disabledContentColor = AppColors.TextInverse.copy(alpha = 0.6f)
            )
            ButtonVariant.Outlined -> ButtonDefaults.buttonColors(
                containerColor = Color.Transparent,
                contentColor = AppColors.Primary,
                disabledContainerColor = Color.Transparent,
                disabledContentColor = AppColors.Primary.copy(alpha = 0.6f)
            )
            ButtonVariant.Text -> ButtonDefaults.buttonColors(
                containerColor = Color.Transparent,
                contentColor = AppColors.Primary,
                disabledContainerColor = Color.Transparent,
                disabledContentColor = AppColors.Primary.copy(alpha = 0.6f)
            )
        },
        shape = RoundedCornerShape(when (size) {
            ButtonSize.Small -> 4.dp
            ButtonSize.Medium -> 8.dp
            ButtonSize.Large -> 12.dp
        }),
        enabled = enabled,
        border = if (variant == ButtonVariant.Outlined) {
            BorderStroke(1.dp, if (enabled) AppColors.Primary else AppColors.Primary.copy(alpha = 0.6f))
        } else null
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            icon?.let {
                Icon(
                    imageVector = it,
                    contentDescription = null,
                    modifier = Modifier.size(when (size) {
                        ButtonSize.Small -> 16.dp
                        ButtonSize.Medium -> 20.dp
                        ButtonSize.Large -> 24.dp
                    })
                )
            }
            Text(
                text = text,
                style = when (size) {
                    ButtonSize.Small -> AppTypography.LabelSmall
                    ButtonSize.Medium -> AppTypography.LabelMedium
                    ButtonSize.Large -> AppTypography.LabelLarge
                }
            )
        }
    }
}

enum class ButtonVariant {
    Primary,
    Secondary,
    Outlined,
    Text
}

enum class ButtonSize {
    Small,
    Medium,
    Large
}

@Composable
fun AppTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    leadingIcon: ImageVector? = null,
    trailingIcon: ImageVector? = null,
    onTrailingIconClick: (() -> Unit)? = null,
    isError: Boolean = false,
    errorMessage: String? = null,
    enabled: Boolean = true,
    singleLine: Boolean = true,
    maxLines: Int = 1,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default,
    visualTransformation: VisualTransformation = VisualTransformation.None
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            label = { Text(text = label) },
            placeholder = { Text(text = placeholder) },
            leadingIcon = leadingIcon?.let {
                {
                    Icon(
                        imageVector = it,
                        contentDescription = null,
                        tint = AppColors.TextTertiary
                    )
                }
            },
            trailingIcon = trailingIcon?.let {
                {
                    IconButton(onClick = { onTrailingIconClick?.invoke() }) {
                        Icon(
                            imageVector = it,
                            contentDescription = null,
                            tint = AppColors.TextTertiary
                        )
                    }
                }
            },
            isError = isError,
            enabled = enabled,
            singleLine = singleLine,
            maxLines = maxLines,
            keyboardOptions = keyboardOptions,
            keyboardActions = keyboardActions,
            visualTransformation = visualTransformation,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AppColors.Primary,
                unfocusedBorderColor = AppColors.Border,
                errorBorderColor = AppColors.Error,
                focusedLabelColor = AppColors.Primary,
                unfocusedLabelColor = AppColors.TextSecondary,
                errorLabelColor = AppColors.Error,
                cursorColor = AppColors.Primary,
                errorCursorColor = AppColors.Error
            ),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier.fillMaxWidth()
        )
        
        if (isError && errorMessage != null) {
            Text(
                text = errorMessage,
                style = AppTypography.BodySmall,
                color = AppColors.Error
            )
        }
    }
}

@Composable
fun AppCard(
    modifier: Modifier = Modifier,
    elevation: CardElevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    shape: Shape = RoundedCornerShape(12.dp),
    colors: CardColors = CardDefaults.cardColors(
        containerColor = AppColors.Surface
    ),
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier,
        elevation = elevation,
        shape = shape,
        colors = colors
    ) {
        Column(
            modifier = Modifier.padding(AppSpacing.Medium.dp),
            verticalArrangement = Arrangement.spacedBy(AppSpacing.Small.dp)
        ) {
            content()
        }
    }
}

@Composable
fun AppProgressIndicator(
    modifier: Modifier = Modifier,
    message: String? = null,
    style: ProgressStyle = ProgressStyle.Circular
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(AppSpacing.Medium.dp)
    ) {
        when (style) {
            ProgressStyle.Circular -> {
                CircularProgressIndicator(
                    color = AppColors.Primary,
                    strokeWidth = 4.dp
                )
            }
            ProgressStyle.Linear -> {
                LinearProgressIndicator(
                    color = AppColors.Primary,
                    trackColor = AppColors.Primary.copy(alpha = 0.3f)
                )
            }
        }
        
        message?.let {
            Text(
                text = it,
                style = AppTypography.BodyMedium,
                color = AppColors.TextSecondary
            )
        }
    }
}

enum class ProgressStyle {
    Circular,
    Linear
}