import api from './api';
import type { ApiResponse, PageResponse, PageRequest, User } from '@/types/api'; // 引用统一的类型定义

// 定义用户审核接口所需的数据结构
interface UserApprovalData {
    status: 'ACTIVE' | 'INACTIVE';
    reason: string;
    notes?: string;
}

// 定义用户管理组件中实际使用的 User 类型，与 UserManagement.tsx 中的定义保持一致
// 注意：这与 src/types/api.ts 中的 User 定义略有不同，需要整合
export interface AdminUser extends User {
    username: string; // UserManagement.tsx 需要 username
    status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'DELETED';
    emailVerified: boolean;
}

/**
 * 获取用户列表（支持分页和搜索）
 * @param params - 包含分页和搜索关键词的参数
 */
export const getUsers = (params: PageRequest & { keyword?: string }): Promise<ApiResponse<PageResponse<AdminUser>>> => {
    // 根据有无 keyword，决定请求的 URL
    const url = params.keyword ? '/admin/users/search' : '/admin/users';
    return api.get(url, { params });
};

/**
 * 发送删除用户的验证码
 * @param userId - 用户ID
 */
export const sendDeleteVerificationCode = (userId: string): Promise<ApiResponse<string>> => {
    return api.post(`/admin/users/${userId}/send-delete-code`);
};

/**
 * 删除用户
 * @param userId - 用户ID
 * @param verificationCode - 邮箱验证码
 */
export const deleteUser = (userId: string, verificationCode: string): Promise<ApiResponse<string>> => {
    // 对于 axios 的 delete 方法，请求体需要放在 data 属性中
    return api.delete(`/admin/users/${userId}`, {
        data: { verificationCode }
    });
};

/**
 * 审核用户
 * @param userId - 用户ID
 * @param approvalData - 审核数据
 */
export const approveUser = (userId: string, approvalData: UserApprovalData): Promise<ApiResponse<AdminUser>> => {
    return api.post(`/admin/users/${userId}/approve`, approvalData);
};

/**
 * 获取当前登录的管理员（用户）信息
 * 该方法调用后端的 /api/user/profile 接口
 */
export const getCurrentAdmin = (): Promise<ApiResponse<AdminUser>> => {
    // api 实例的 baseURL 是 '/api'，所以这里的路径是 '/user/profile'
    return api.get('/user/profile');
};

/**
 * 验证当前密码
 * @param currentPassword - 当前密码
 */
export const verifyCurrentPassword = (currentPassword: string): Promise<ApiResponse<boolean>> => {
    return api.post('/api/user/verify-password', {
        currentPassword
    });
};

/**
 * 修改密码
 * @param currentPassword - 当前密码
 * @param newPassword - 新密码
 */
export const changePassword = (currentPassword: string, newPassword: string): Promise<ApiResponse<string>> => {
    return api.put('/api/user/change-password', {
        currentPassword,
        newPassword
    });
};

/**
 * 换绑邮箱
 * @param data - 换绑邮箱的数据
 */
export const changeEmail = (data: {
    currentPassword: string;
    newEmail: string;
    currentEmailCode: string;
    newEmailCode: string;
}): Promise<ApiResponse<AdminUser>> => {
    return api.put('/api/user/change-email', data);
};

/**
 * 发送邮箱验证码
 * @param email - 邮箱地址
 * @param codeType - 验证码类型
 */
export const sendEmailVerificationCode = (email: string, codeType: string): Promise<ApiResponse<string>> => {
    return api.post('/api/email/send-code', {
        email,
        codeType
    });
};

/**
 * 验证邮箱验证码
 * @param email - 邮箱地址
 * @param code - 验证码
 * @param codeType - 验证码类型
 */
export const verifyEmailCode = (email: string, code: string, codeType: string): Promise<ApiResponse<boolean>> => {
    return api.post('/api/email/verify-code', {
        email,
        code,
        codeType
    });
};