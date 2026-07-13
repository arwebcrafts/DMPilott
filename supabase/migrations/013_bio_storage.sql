-- Public storage bucket for Link in Bio images (avatars, backgrounds)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bio-assets',
  'bio-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Users can upload to their own folder
create policy "Users upload own bio assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'bio-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Public read bio assets"
on storage.objects for select
to public
using (bucket_id = 'bio-assets');

create policy "Users delete own bio assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'bio-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);
