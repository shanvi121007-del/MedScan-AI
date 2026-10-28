import { useCallback, useEffect, useState } from 'react';
import type { AnalysisRecord, Modality, AnalysisStatus } from './types';
import { supabase } from './supabase';
import { useSession } from './session';

const TABLE = 'analysis_history';

const VALID_MODALITIES: Modality[] = [
  'mri',
  'histopathology',
  'report',
];

/**
 * Pub/sub mechanism to refresh mounted History components
 * whenever a new record is successfully inserted or deleted.
 */
const refreshListeners = new Set<() => void>();

function notifyHistoryRefresh(): void {
  for (const listener of refreshListeners) {
    listener();
  }
}

interface DbRow {
  id: string;
  modality: string;
  file_name: string;
  file_type: string | null;
  file_size: number | string | null;
  status: string;
  note: string | null;
  created_at: string;
}

function dbRowToRecord(row: DbRow): AnalysisRecord {
  const modality = row.modality as Modality;

  return {
    id: row.id,
    modality,
    fileName: row.file_name,
    fileType: row.file_type ?? '',
    fileSize: Number(row.file_size ?? 0),
    status: row.status as AnalysisStatus,
    createdAt: new Date(row.created_at).getTime(),
    note: row.note ?? '',
  };
}

export interface HistoryState {
  records: AnalysisRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Insert an analysis record into Supabase.
 *
 * Requires an authenticated session and an appropriate INSERT policy.
 * The database must contain the columns used below.
 */
export async function addRecord(
  record: Omit<AnalysisRecord, 'id' | 'createdAt'>,
): Promise<void> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!sessionData.session) {
    throw new Error('Please sign in before saving analysis history.');
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      modality: record.modality,
      file_name: record.fileName,
      file_type: record.fileType,
      file_size: record.fileSize,
      status: record.status,
      note: record.note,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[MedScan] Failed to insert analysis history:', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    });

    throw error;
  }

  console.info('[MedScan] Analysis history inserted:', {
    rowId: data.id,
  });

  notifyHistoryRefresh();
}

/**
 * Delete analysis history belonging to the current authenticated user.
 *
 * IMPORTANT:
 * The DELETE policy must restrict deletion to the user's own rows.
 * This query does not disable or bypass RLS.
 */
export async function clearHistory(): Promise<void> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!sessionData.session) {
    throw new Error('Please sign in before clearing analysis history.');
  }

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .not('id', 'is', null);

  if (error) {
    console.error('[MedScan] Failed to clear analysis history:', {
      code: error.code,
      message: error.message,
      hint: error.hint,
    });

    throw error;
  }

  notifyHistoryRefresh();
}

/**
 * Load analysis history for the current authenticated session.
 */
export function useAnalysisHistory(): HistoryState {
  const { session } = useSession();

  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (signal: AbortSignal) => {
    if (signal.aborted) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from(TABLE)
        .select(
          [
            'id',
            'modality',
            'file_name',
            'file_type',
            'file_size',
            'status',
            'note',
            'created_at',
          ].join(', '),
        )
        .order('created_at', { ascending: false })
        .limit(200);

      if (signal.aborted) return;

      if (queryError) {
        throw queryError;
      }

      const validRecords = ((data ?? []) as unknown as DbRow[])
        .filter((row) => {
          const modality = row.modality;

          return (
            typeof modality === 'string' &&
            VALID_MODALITIES.includes(modality as Modality)
          );
        })
        .map(dbRowToRecord);

      if (signal.aborted) return;

      setRecords(validRecords);
      setError(null);
    } catch (err) {
      if (signal.aborted) return;

      const message =
        err instanceof Error
          ? err.message
          : 'Could not load analysis history.';

      console.error('[MedScan] Failed to fetch analysis history:', message);

      setRecords([]);
      setError(message);
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setRecords([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    void fetchHistory(controller.signal);

    const onRefresh = () => {
      void fetchHistory(new AbortController().signal);
    };

    refreshListeners.add(onRefresh);

    return () => {
      controller.abort();
      refreshListeners.delete(onRefresh);
    };
  }, [session, fetchHistory]);

  const refresh = useCallback(() => {
    if (!session) {
      setRecords([]);
      setLoading(false);
      setError(null);
      return;
    }

    void fetchHistory(new AbortController().signal);
  }, [session, fetchHistory]);

  return {
    records,
    loading,
    error,
    refresh,
  };
}

export { VALID_MODALITIES };


