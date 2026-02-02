import uuid
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, asc, desc, update
from datetime import datetime, timezone

from backend.src.domain.interfaces import IProjectRepository
from backend.src.domain.entities.project import Project, ProjectStatus
from backend.src.infrastructure.db.models.project import ProjectModel

class SqlAlchemyProjectRepository(IProjectRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, project_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Project]:
        query = select(ProjectModel).where(
            ProjectModel.id == project_id,
            ProjectModel.user_id == user_id,
            ProjectModel.deleted_at.is_(None)
        )
        result = await self.session.execute(query)
        model = result.scalars().first()
        return self._to_entity(model) if model else None

    async def get_all_by_user(
        self, 
        user_id: uuid.UUID, 
        page: int, 
        page_size: int,
        search: Optional[str] = None,
        status: Optional[ProjectStatus] = None,
        folder_id: Optional[uuid.UUID] = None,
        is_root: bool = False,  
        sort_by: str = "updated_at",  
        sort_order: str = "desc"      
    ) -> Tuple[List[Project], int]:
        
        conditions = [
            ProjectModel.user_id == user_id,
            ProjectModel.deleted_at.is_(None)
        ]

        if folder_id:
             conditions.append(ProjectModel.folder_id == folder_id)
        elif is_root:
             conditions.append(ProjectModel.folder_id.is_(None))

        if search:
            conditions.append(ProjectModel.title.ilike(f"%{search}%"))
            
        if status:
            conditions.append(ProjectModel.status == status)

        # محاسبه تعداد
        count_query = select(func.count()).where(*conditions)
        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        # کوئری اصلی
        query = select(ProjectModel).where(*conditions)

        # مرتب‌سازی
        sort_column = getattr(ProjectModel, sort_by, ProjectModel.updated_at)
        if sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        query = query.offset((page - 1) * page_size).limit(page_size)
        
        result = await self.session.execute(query)
        models = result.scalars().all()
        
        return [self._to_entity(m) for m in models], total

    async def create(self, project: Project) -> Project:
        model = ProjectModel(
            id=project.id,
            user_id=project.user_id,
            title=project.title,
            status=project.status,
            thumbnail_url=project.thumbnail_url,
            created_at=project.created_at,
            updated_at=project.updated_at
        )
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def update(self, project: Project) -> Project:
        # نکته: ما از خود مدل استفاده می‌کنیم تا سشن ترک نکند
        query = select(ProjectModel).where(ProjectModel.id == project.id)
        result = await self.session.execute(query)
        model = result.scalars().first()
        
        if not model:
            raise ValueError("Project not found")

        model.title = project.title
        model.folder_id = project.folder_id
        model.status = project.status
        model.thumbnail_url = project.thumbnail_url
        model.updated_at = project.updated_at
        model.deleted_at = project.deleted_at
        
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_entity(model)

    async def duplicate(self, project_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Project]:
        original_model = await self.get_by_id(project_id, user_id)
        if not original_model:
            return None

        new_project = ProjectModel(
            id=uuid.uuid4(),
            user_id=user_id,
            title=f"Copy of {original_model.title}",
            status=ProjectStatus.DRAFT,
            thumbnail_url=original_model.thumbnail_url,
            folder_id=original_model.folder_id # کپی در همان پوشه
        )
        
        self.session.add(new_project)
        await self.session.commit()
        await self.session.refresh(new_project)
        
        return self._to_entity(new_project)
    
    async def batch_archive(self, project_ids: List[uuid.UUID], user_id: uuid.UUID):
        stmt = update(ProjectModel).where(
            ProjectModel.id.in_(project_ids),
            ProjectModel.user_id == user_id
        ).values(deleted_at=datetime.now(timezone.utc))
        
        await self.session.execute(stmt)
        await self.session.commit()

    def _to_entity(self, model: ProjectModel) -> Project:
        return Project(
            id=model.id,
            user_id=model.user_id,
            title=model.title,
            status=model.status,
            thumbnail_url=model.thumbnail_url,
            folder_id=model.folder_id, # ✨ اضافه شد
            created_at=model.created_at,
            updated_at=model.updated_at,
            deleted_at=model.deleted_at
        )