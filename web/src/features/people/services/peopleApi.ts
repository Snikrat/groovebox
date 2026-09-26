import { api } from '../../../shared/services/api';
import type { PersonSummary, SuggestedPerson } from '../types/person';

export async function searchPeople(query: string): Promise<PersonSummary[]> {
  const { data } = await api.get<PersonSummary[]>('/people/search', { params: { q: query } });
  return data;
}

export async function getSuggestedPeople(): Promise<SuggestedPerson[]> {
  const { data } = await api.get<SuggestedPerson[]>('/people/suggested');
  return data;
}
