// User Profile API Route - GET/POST /api/user

import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserProfile, 
  saveUserProfile, 
  clearUserProfile,
  generateId 
} from '@/lib/storage';
import { 
  CreateUserProfileSchema, 
  UserProfileSchema 
} from '@/lib/schemas';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse,
  getValidatedBody 
} from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const profile = getUserProfile();
    
    if (!profile) {
      return NextResponse.json(
        errorResponse('User profile not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(successResponse(profile));
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch user profile', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const validation = await getValidatedBody(request, CreateUserProfileSchema);
    
    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }
    
    const profileData = validation.data;
    
    // Check if profile already exists
    const existingProfile = getUserProfile();
    
    const now = new Date().toISOString();
    const profile = {
      ...profileData,
      id: profileData.id || existingProfile?.id || generateId(),
      createdAt: existingProfile?.createdAt || now,
      updatedAt: now,
    };
    
    // Validate the complete profile
    const fullValidation = UserProfileSchema.safeParse(profile);
    if (!fullValidation.success) {
      const errors: Record<string, string[]> = {};
      fullValidation.error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return NextResponse.json(validationErrorResponse(errors), { status: 400 });
    }
    
    saveUserProfile(profile);
    
    return NextResponse.json(
      successResponse(profile, existingProfile ? 'Profile updated' : 'Profile created'),
      { status: existingProfile ? 200 : 201 }
    );
  } catch (error) {
    console.error('Error saving user profile:', error);
    return NextResponse.json(
      errorResponse('Failed to save user profile', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    clearUserProfile();
    return NextResponse.json(successResponse(null, 'Profile deleted'));
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return NextResponse.json(
      errorResponse('Failed to delete user profile', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
