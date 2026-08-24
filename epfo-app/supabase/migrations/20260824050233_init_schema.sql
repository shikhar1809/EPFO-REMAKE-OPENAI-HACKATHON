-- Create User Profiles
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  phone text,
  has_completed_profile boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create Document Vault
CREATE TABLE public.document_vault (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  aadhaar_number_encrypted text,
  pan_number_encrypted text,
  bank_account_encrypted text,
  bank_ifsc text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(user_id)
);

ALTER TABLE public.document_vault ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own vault" ON public.document_vault FOR ALL USING (auth.uid() = user_id);

-- Create Passbook
CREATE TABLE public.passbook (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  month text not null,
  employee_share numeric not null,
  employer_share numeric not null,
  pension_share numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.passbook ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own passbook" ON public.passbook FOR SELECT USING (auth.uid() = user_id);

-- Create Claims
CREATE TABLE public.claims (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  claim_type text not null,
  status text not null,
  amount numeric,
  date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own claims" ON public.claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own claims" ON public.claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger to automatically insert a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, has_completed_profile)
  VALUES (new.id, new.email, new.phone, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
