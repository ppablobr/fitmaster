/*
  # Create exercises table

  1. New Tables
    - `exercises`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text)
      - `duration` (numeric)
      - `distance` (numeric)
      - `pace` (numeric)
      - `date` (timestamptz)
      - `comments` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `exercises` table
    - Add policy for authenticated users to read and write their own data
*/

CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  type text NOT NULL,
  duration numeric NOT NULL,
  distance numeric NOT NULL,
  pace numeric NOT NULL,
  date timestamptz NOT NULL,
  comments text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own exercises"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises"
  ON exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
