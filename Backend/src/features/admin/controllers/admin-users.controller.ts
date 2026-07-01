import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { CreateAdminUserDto } from '../dto/create-admin-user.dto';
import { UpdateAdminUserDto } from '../dto/update-admin-user.dto';
import { GetUsersUseCase } from '../use-cases/get-users.use-case';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../use-cases/delete-user.use-case';

// Tous les endpoints de ce controller sont réservés aux admins
@ApiTags('Administration — Utilisateurs')
@ApiCookieAuth('access_token')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
    constructor(
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
    ) {}

    @Get()
    findAll(@Query() query: PaginationQueryDto) {
        return this.getUsersUseCase.execute(query);
    }

    @Post()
    create(@Body() dto: CreateAdminUserDto) {
        return this.createUserUseCase.execute(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
        return this.updateUserUseCase.execute(id, dto);
    }

    @Delete(':id')
    remove(
        @Param('id') id: string,
        @Request() req: { user: { userId: string } },
    ) {
        // On passe l'id de l'admin connecté pour la règle d'auto-suppression
        return this.deleteUserUseCase.execute(req.user.userId, id);
    }
}
