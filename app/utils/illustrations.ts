import { Illustration } from '@/app/types/illustration';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// 全イラスト取得
export async function fetchIllustrations(): Promise<Illustration[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/illustrations`);
    const data = await response.json();
    
    if (data.success) {
      return data.illustrations;
    } else {
      console.error('Failed to fetch illustrations:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching illustrations:', error);
    return [];
  }
}

// 個別イラスト取得
export async function fetchIllustration(id: number): Promise<Illustration | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/illustrations/${id}`);
    const data = await response.json();
    
    if (data.success) {
      return data.illustration;
    } else {
      console.error('Failed to fetch illustration:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching illustration:', error);
    return null;
  }
}

// 新規イラスト作成
export async function createIllustration(illustrationData: Omit<Illustration, 'id' | 'downloads'>): Promise<Illustration | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/illustrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(illustrationData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.illustration;
    } else {
      console.error('Failed to create illustration:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error creating illustration:', error);
    return null;
  }
}

// イラスト更新
export async function updateIllustration(id: number, updates: Partial<Illustration>): Promise<Illustration | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/illustrations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.illustration;
    } else {
      console.error('Failed to update illustration:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error updating illustration:', error);
    return null;
  }
}

// イラスト削除
export async function deleteIllustration(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/illustrations/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (data.success) {
      return true;
    } else {
      console.error('Failed to delete illustration:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error deleting illustration:', error);
    return false;
  }
}
