-- Create a function to validate username format and profanity
CREATE OR REPLACE FUNCTION public.validate_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profanity_words TEXT[] := ARRAY[
    'fuck', 'shit', 'ass', 'bitch', 'damn', 'cunt', 'dick', 'cock', 'pussy',
    'bastard', 'whore', 'slut', 'fag', 'nigger', 'nigga', 'retard', 'nazi',
    'penis', 'vagina', 'asshole', 'motherfucker', 'bullshit', 'piss'
  ];
  lower_username TEXT;
  word TEXT;
BEGIN
  -- Only validate if username is being changed
  IF TG_OP = 'UPDATE' AND OLD.username = NEW.username THEN
    RETURN NEW;
  END IF;
  
  -- Check length (3-20 characters)
  IF LENGTH(TRIM(NEW.username)) < 3 THEN
    RAISE EXCEPTION 'Username must be at least 3 characters';
  END IF;
  
  IF LENGTH(TRIM(NEW.username)) > 20 THEN
    RAISE EXCEPTION 'Username must be 20 characters or less';
  END IF;
  
  -- Check format (letters, numbers, spaces only)
  IF NEW.username !~ '^[a-zA-Z0-9 ]+$' THEN
    RAISE EXCEPTION 'Username can only contain letters, numbers, and spaces';
  END IF;
  
  -- Check for consecutive spaces
  IF NEW.username ~ '\s{2,}' THEN
    RAISE EXCEPTION 'Username cannot contain consecutive spaces';
  END IF;
  
  -- Check for profanity
  lower_username := LOWER(NEW.username);
  FOREACH word IN ARRAY profanity_words
  LOOP
    IF lower_username LIKE '%' || word || '%' THEN
      RAISE EXCEPTION 'Username contains inappropriate language';
    END IF;
  END LOOP;
  
  -- Trim the username
  NEW.username := TRIM(NEW.username);
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate username on insert and update
CREATE TRIGGER validate_username_trigger
BEFORE INSERT OR UPDATE OF username ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_username();