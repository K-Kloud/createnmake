import { supabase } from "@/integrations/supabase/client";
import { CreateTryOnSessionParams, GenerateTryOnParams, VirtualTryOnSession } from "@/types/tryon";

export const virtualTryOnService = {
  /**
   * Upload body reference image to storage
   */
  async uploadBodyReference(file: File, userId: string): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${file.name}`;

    const { data, error } = await supabase.storage
      .from("tryon-references")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("tryon-references")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  /**
   * Create a new try-on session
   */
  async createSession(params: CreateTryOnSessionParams): Promise<VirtualTryOnSession> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("virtual_tryon_sessions")
      .insert([{
        user_id: user.id,
        body_reference_url: params.bodyImageUrl,
        generated_image_id: params.generatedImageId,
        settings: params.settings || {},
        status: "pending" as const,
      }] as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data as VirtualTryOnSession;
  },

  /**
   * Generate try-on result
   */
  async generateTryOn(params: GenerateTryOnParams): Promise<VirtualTryOnSession> {
    const { data, error } = await supabase.functions.invoke("virtual-tryon", {
      body: {
        sessionId: params.sessionId,
        bodyImageUrl: params.bodyImageUrl,
        clothingImageUrl: params.clothingImageUrl,
        settings: params.settings || {},
      },
    });

    if (error) {
      throw new Error(`Failed to generate try-on: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || "Try-on generation failed");
    }

    // Fetch updated session
    const { data: session, error: fetchError } = await supabase
      .from("virtual_tryon_sessions")
      .select()
      .eq("id", params.sessionId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch session: ${fetchError.message}`);
    }

    return session as VirtualTryOnSession;
  },

  /**
   * Get user's try-on history
   */
  async getTryOnHistory(): Promise<VirtualTryOnSession[]> {
    const { data, error } = await supabase
      .from("virtual_tryon_sessions")
      .select()
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch history: ${error.message}`);
    }

    return data as VirtualTryOnSession[];
  },

  /**
   * Get a specific session
   */
  async getSession(sessionId: number): Promise<VirtualTryOnSession | null> {
    const { data, error } = await supabase
      .from("virtual_tryon_sessions")
      .select()
      .eq("id", sessionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch session: ${error.message}`);
    }

    return data as VirtualTryOnSession;
  },

  /**
   * Delete a try-on session
   */
  async deleteSession(sessionId: number): Promise<void> {
    const { error } = await supabase
      .from("virtual_tryon_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  },
};
