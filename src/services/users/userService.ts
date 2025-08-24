import { z } from 'zod';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../endpoints';
import { userSchema } from '@/schemas/user.schemas';
import { User } from '@/types/user.types';

const getUsersRequestSchema = z.object({
  limit: z.number().optional(),
});

const getUsersResponseSchema = z.array(userSchema);

type GetUsersRequest = z.infer<typeof getUsersRequestSchema>;
type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;

class UserService {
  async getUsers(request?: GetUsersRequest): Promise<GetUsersResponse> {
    const validatedRequest = request 
      ? getUsersRequestSchema.parse(request) 
      : undefined;

    const response = await apiClient.get<GetUsersResponse>(
      API_ENDPOINTS.USERS.LIST,
      { params: validatedRequest }
    );

    return getUsersResponseSchema.parse(response);
  }

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(
      API_ENDPOINTS.USERS.DETAIL(id)
    );

    return userSchema.parse(response);
  }
}

export const userService = new UserService();