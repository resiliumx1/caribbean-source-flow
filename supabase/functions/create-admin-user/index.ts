import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const email = "kailash123@gmail.com";
    const password = "admin123";

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some((u) => u.email === email);

    if (userExists) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "User already exists. Use the login page." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Create the user
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (createError) {
      throw createError;
    }

    // Set admin flag on the profile (trigger creates profile automatically)
    // Wait a moment for trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_admin: true })
      .eq("email", email);

    if (updateError) {
      console.error("Error setting admin flag:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created successfully",
        email,
        userId: user.user?.id,
        note: "Password is: admin123 - Please change it after first login.",
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
