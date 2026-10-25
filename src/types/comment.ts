// src/types/comment.ts
export interface Comment {
    id: string
    content: string
    renderedContent?: string
    authorId: string
    authorName: string
    authorAvatar?: string
    parentId?: string
    depth: number
    status: CommentStatus
    approved: boolean
    pinned: boolean
    likeCount: number
    replyCount: number
    replies?: Comment[]
    createdAt: string
    updatedAt: string
}

export enum CommentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SPAM = 'SPAM',
    DELETED = 'DELETED'
}

export interface CommentCreateRequest {
    content: string
    parentId?: string
}