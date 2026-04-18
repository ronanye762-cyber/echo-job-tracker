import { supabase } from './supabase'
import type { Application, Status, Review } from '../types'

// ── Row → Model mappers ────────────────────────────────────────────────────────

function mapStatus(row: Record<string, unknown>): Status {
  return {
    id:        row.id as string,
    name:      row.name as string,
    sortOrder: row.sort_order as number,
    color:     row.color as string,
  }
}

function mapApplication(row: Record<string, unknown>): Application {
  return {
    id:          row.id as string,
    companyName: row.company_name as string,
    jobTitle:    row.job_title as string,
    statusId:    row.status_id as string,
    deadline:    row.deadline as string | undefined,
    isArchived:  row.is_archived as boolean,
  }
}

function mapReview(row: Record<string, unknown>): Review {
  return {
    id:            row.id as string,
    applicationId: row.application_id as string,
    companyName:   row.company_name as string,
    jobTitle:      row.job_title as string,
    failStage:     row.fail_stage as string,
    reasonTags:    row.reason_tags as string[],
    notes:         row.notes as string,
    createdAt:     row.created_at as string,
  }
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

export async function fetchStatuses(): Promise<Status[]> {
  const { data, error } = await supabase
    .from('statuses')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return (data ?? []).map(mapStatus)
}

export async function fetchApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapApplication)
}

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapReview)
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function insertApplications(apps: Application[]): Promise<void> {
  const rows = apps.map((a) => ({
    id:           a.id,
    company_name: a.companyName,
    job_title:    a.jobTitle,
    status_id:    a.statusId,
    deadline:     a.deadline ?? null,
    is_archived:  false,
  }))
  const { error } = await supabase.from('applications').insert(rows)
  if (error) throw error
}

export async function updateApplicationStatus(id: string, statusId: string): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({ status_id: statusId })
    .eq('id', id)
  if (error) throw error
}

export async function dbArchiveApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({ is_archived: true })
    .eq('id', id)
  if (error) throw error
}

export async function insertReview(review: Review): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    id:             review.id,
    application_id: review.applicationId,
    company_name:   review.companyName,
    job_title:      review.jobTitle,
    fail_stage:     review.failStage,
    reason_tags:    review.reasonTags,
    notes:          review.notes,
  })
  if (error) throw error
}
