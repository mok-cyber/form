-- A Little Adventure / Treasure Form
-- Public visitors can INSERT form submissions only.
-- Anonymous visitors are not granted SELECT, UPDATE, or DELETE.

CREATE TABLE IF NOT EXISTS public.form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL CHECK (BTRIM(full_name) <> ''),
    recent_days TEXT,
    invitation_choice TEXT NOT NULL
        CHECK (invitation_choice IN ('yes', 'interested', 'no')),
    transport_choice TEXT
        CHECK (transport_choice IN ('pickup', 'meet_there')),
    work_finish_time TIME,
    preferred_meeting_time TIME,
    interested_reason TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_response_path CHECK (
        (
            invitation_choice = 'yes'
            AND (
                (
                    transport_choice = 'pickup'
                    AND work_finish_time IS NOT NULL
                    AND preferred_meeting_time IS NULL
                    AND interested_reason IS NULL
                )
                OR
                (
                    transport_choice = 'meet_there'
                    AND preferred_meeting_time IS NOT NULL
                    AND work_finish_time IS NULL
                    AND interested_reason IS NULL
                )
            )
        )
        OR
        (
            invitation_choice = 'interested'
            AND transport_choice IS NULL
            AND work_finish_time IS NULL
            AND preferred_meeting_time IS NULL
            AND NULLIF(BTRIM(interested_reason), '') IS NOT NULL
        )
        OR
        (
            invitation_choice = 'no'
            AND transport_choice IS NULL
            AND work_finish_time IS NULL
            AND preferred_meeting_time IS NULL
            AND interested_reason IS NULL
        )
    )
);

ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES
ON TABLE public.form_responses
FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.form_responses TO anon;

DROP POLICY IF EXISTS "Allow public form submissions"
ON public.form_responses;

CREATE POLICY "Allow public form submissions"
ON public.form_responses
FOR INSERT
TO anon
WITH CHECK (TRUE);
