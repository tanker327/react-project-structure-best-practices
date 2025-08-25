import { z } from 'zod';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../endpoints';
import { userSchema } from '@/schemas/user.schemas';
import type { User } from '@/types/user.types';
import { HandleError, ServiceErrorHandler } from '../decorators/errorHandler.decorator';

const getUsersRequestSchema = z.object({
  limit: z.number().optional(),
});

const getUsersResponseSchema = z.array(userSchema);

type GetUsersRequest = z.infer<typeof getUsersRequestSchema>;
type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;

@ServiceErrorHandler('UserService')
class UserService {
  @HandleError()
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

  @HandleError()
  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(
      API_ENDPOINTS.USERS.DETAIL(id)
    );

    return userSchema.parse(response);
  }
}

export const userService = new UserService();