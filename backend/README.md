# Backend deployment

# Backend deployment

Uploaded food, restaurant, and user images are stored under `UPLOADS_DIR` and served from `/uploads`. Render's default filesystem is ephemeral, so uploaded files disappear on redeploy/restart unless the service has a persistent disk.

## Configure a Render persistent disk

1. Deploy the updated backend.
2. In the Render backend service, open **Disks** and create a disk mounted at `/var/data`.
3. In the service's **Environment** settings, set `UPLOADS_DIR` to `/var/data/uploads`.
4. Save the changes and redeploy the service.
5. Upload or replace restaurant and food images in the admin app. The API stores them on the disk and returns paths such as `/uploads/foods/<filename>`.
6. Verify an uploaded image by opening `https://<your-backend-host>/uploads/foods/<filename>`.

Images uploaded before the disk was attached are not copied automatically. Re-upload them after setup; MongoDB's existing image paths will then be updated to the new files.
