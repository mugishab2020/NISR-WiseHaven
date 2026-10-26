"""Allocation plan controller."""

from fastapi import APIRouter, HTTPException, status, Depends
from models import get_db
from prisma import Prisma
from services.allocation_service import AllocationService
from utils.dependencies import get_current_user_id
from views.allocation_schemas import (
    AllocationPlanCreateRequest,
    AllocationPlanResponse,
    AllocationPlanListResponse,
    AllocationItemResponse
)

router = APIRouter(prefix="/allocation-plans", tags=["Allocation Plans"])


@router.get("", response_model=AllocationPlanListResponse)
async def get_allocation_plans(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Get all allocation plans for authenticated user."""
    try:
        allocation_service = AllocationService(db)
        plans = await allocation_service.get_user_allocation_plans(user_id)
        
        # Convert to response format
        plan_responses = []
        for plan in plans:
            items = [AllocationItemResponse(**item) for item in plan["items"]]
            plan_responses.append(
                AllocationPlanResponse(
                    id=plan["id"],
                    name=plan["name"],
                    is_active=plan["is_active"],
                    items=items,
                    created_at=plan["created_at"],
                    updated_at=plan["updated_at"]
                )
            )
        
        return AllocationPlanListResponse(plans=plan_responses)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve allocation plans: {str(e)}"
        )


@router.post("", response_model=AllocationPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_allocation_plan(
    request: AllocationPlanCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Create new allocation plan.
    
    Validates:
    - Percentages sum to exactly 100%
    - All percentages are non-negative
    - All referenced envelopes exist and are active
    """
    try:
        allocation_service = AllocationService(db)
        
        # Convert items to dict format
        items = [
            {"envelope_id": item.envelope_id, "percentage": item.percentage}
            for item in request.items
        ]
        
        plan = await allocation_service.create_allocation_plan(
            user_id=user_id,
            name=request.name,
            items=items
        )
        
        # Convert to response format
        item_responses = [AllocationItemResponse(**item) for item in plan["items"]]
        
        return AllocationPlanResponse(
            id=plan["id"],
            name=plan["name"],
            is_active=plan["is_active"],
            items=item_responses,
            created_at=plan["created_at"],
            updated_at=plan["updated_at"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create allocation plan: {str(e)}"
        )


@router.get("/{plan_id}", response_model=AllocationPlanResponse)
async def get_allocation_plan(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Get specific allocation plan by ID."""
    try:
        allocation_service = AllocationService(db)
        plan = await allocation_service.get_allocation_plan(plan_id, user_id)
        
        # Convert to response format
        item_responses = [AllocationItemResponse(**item) for item in plan["items"]]
        
        return AllocationPlanResponse(
            id=plan["id"],
            name=plan["name"],
            is_active=plan["is_active"],
            items=item_responses,
            created_at=plan["created_at"],
            updated_at=plan["updated_at"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve allocation plan: {str(e)}"
        )


@router.post("/{plan_id}/activate", response_model=AllocationPlanResponse)
async def activate_allocation_plan(
    plan_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Activate allocation plan.
    
    Deactivates all other plans for the user.
    Validates that all referenced envelopes are active.
    """
    try:
        allocation_service = AllocationService(db)
        plan = await allocation_service.activate_allocation_plan(plan_id, user_id)
        
        # Convert to response format
        item_responses = [AllocationItemResponse(**item) for item in plan["items"]]
        
        return AllocationPlanResponse(
            id=plan["id"],
            name=plan["name"],
            is_active=plan["is_active"],
            items=item_responses,
            created_at=plan["created_at"],
            updated_at=plan["updated_at"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to activate allocation plan: {str(e)}"
        )
