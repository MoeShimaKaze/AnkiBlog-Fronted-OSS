/**
 * Represents the visibility of an article.
 * PUBLIC: Visible to everyone.
 * LOGIN_REQUIRED: Visible only to logged-in users.
 * ADMIN_ONLY: Visible only to administrators.
 */
export const ArticleVisibility = {
    PUBLIC: 'PUBLIC',
    LOGIN_REQUIRED: 'LOGIN_REQUIRED',
    ADMIN_ONLY: 'ADMIN_ONLY',
} as const;

export type ArticleVisibility = typeof ArticleVisibility[keyof typeof ArticleVisibility];

/**
 * Represents the publication status of an article.
 * PUBLISHED: The article is live and visible according to its visibility setting.
 * DRAFT: The article is a draft and not publicly visible.
 * SCHEDULED: The article is scheduled to be published at a future date.
 * ARCHIVED: The article has been archived and is not displayed in main listings.
 */
export const ArticleStatus = {
    PUBLISHED: 'PUBLISHED',
    DRAFT: 'DRAFT',
    SCHEDULED: 'SCHEDULED',
    ARCHIVED: 'ARCHIVED',
} as const;

export type ArticleStatus = typeof ArticleStatus[keyof typeof ArticleStatus];