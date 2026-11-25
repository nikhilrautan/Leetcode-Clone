import { useParams, NavLink } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ArrowLeft, Upload, Video, CircleAlert, CheckCircle2 } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

// Pull a readable message out of a backend or Cloudinary error
const getErrorMessage = (err) => {
  const data = err?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.error?.message) return data.error.message; // Cloudinary format
  if (typeof data?.error === 'string') return data.error;
  if (data?.message) return data.message;
  if (err?.response?.status) return `Request failed with status ${err.response.status}`;
  return err?.message || 'Upload failed. Please try again.';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds) => {
  const total = Number(seconds);
  if (!Number.isFinite(total)) return '—';
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
};

function AdminUpload() {
  const { problemId } = useParams();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  const onSubmit = async (data) => {
    const file = data.videoFile[0];

    setUploading(true);
    setUploadProgress(0);
    setUploadedVideo(null); // clear any previous success message
    clearErrors();

    try {
      // Step 1: Get upload signature from backend
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, upload_url } = signatureResponse.data;

      if (!signature || !timestamp || !public_id || !api_key || !upload_url) {
        throw new Error('Backend did not return a complete upload signature.');
      }

      // Step 2: Build the Cloudinary form data.
      // NOTE: every extra param your backend signed (e.g. folder) must be appended here too.
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      // Step 3: Upload directly to Cloudinary (no manual Content-Type header)
      const uploadResponse = await axios.post(upload_url, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      const cloudinaryResult = uploadResponse.data;

      // Step 4: Save video metadata to backend
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
    } catch (err) {
      console.error('Upload error:', err.response?.status, err.response?.data || err.message);
      setError('root', {
        type: 'manual',
        message: getErrorMessage(err),
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="page-container max-w-xl py-8">
        <NavLink to="/admin/video" className="btn btn-ghost btn-sm mb-6 gap-1.5">
          <ArrowLeft size={16} />
          Back to videos
        </NavLink>

        <div className="surface-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
              <Video size={22} />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Upload video</h2>
              <p className="text-sm text-base-content/60">
                Add an editorial video for this problem. Max size 100MB.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* File Input */}
            <div>
              <label htmlFor="videoFile" className="mb-1.5 block text-sm font-medium">
                Video file
              </label>
              <input
                id="videoFile"
                type="file"
                accept="video/*"
                {...register('videoFile', {
                  required: 'Please select a video file',
                  validate: {
                    isVideo: (files) => {
                      if (!files || !files[0]) return 'Please select a video file';
                      return files[0].type.startsWith('video/') || 'Please select a valid video file';
                    },
                    fileSize: (files) => {
                      if (!files || !files[0]) return true;
                      const maxSize = 100 * 1024 * 1024; // 100MB
                      return files[0].size <= maxSize || 'File size must be less than 100MB';
                    },
                  },
                })}
                className={`file-input w-full ${errors.videoFile ? 'file-input-error' : ''}`}
                disabled={uploading}
              />
              {errors.videoFile && (
                <span className="mt-1 block text-sm text-error">{errors.videoFile.message}</span>
              )}
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="flex items-center gap-3 rounded-box border border-base-300 bg-base-200/60 px-4 py-3">
                <Video size={20} className="shrink-0 text-base-content/50" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-base-content/60">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={uploadProgress}
                  max="100"
                ></progress>
              </div>
            )}

            {/* Error Message */}
            {errors.root && (
              <div role="alert" className="alert alert-soft alert-error text-sm">
                <CircleAlert size={16} />
                <span className="break-words">{errors.root.message}</span>
              </div>
            )}

            {/* Success Message */}
            {uploadedVideo && (
              <div role="alert" className="alert alert-soft alert-success text-sm">
                <CheckCircle2 size={16} />
                <div>
                  <h3 className="font-semibold">Upload successful</h3>
                  <p>Duration: {formatDuration(uploadedVideo.duration)}</p>
                  <p>Uploaded: {formatDate(uploadedVideo.uploadedAt || uploadedVideo.createdAt)}</p>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button type="submit" disabled={uploading} className="btn btn-primary w-full gap-2">
              {uploading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Upload size={16} />
              )}
              {uploading ? 'Uploading...' : 'Upload video'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminUpload;