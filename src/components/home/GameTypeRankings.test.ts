import { describe, expect, it } from 'vitest';
import { uniqueLeaderboard } from './unique-leaderboard';
describe('leaderboard per player', () => {
 it('keeps the highest sorted run per user, not per display name', () => {
  const rows=[{id:'1',user_id:'u1',player_name:'Pretinha',score:100},{id:'2',user_id:'u1',player_name:'Pretinha',score:90},{id:'3',user_id:'u2',player_name:'Pretinha',score:80}];
  expect(uniqueLeaderboard(rows).map(x=>x.id)).toEqual(['1','3']);
 });
 it('deduplicates historical guests by normalized name without merging accounts', () => {
  const rows=[{id:'1',user_id:null,player_name:' Guest ',score:100},{id:'2',user_id:null,player_name:'guest',score:90},{id:'3',user_id:'u1',player_name:'Guest',score:80}];
  expect(uniqueLeaderboard(rows).map(x=>x.id)).toEqual(['1','3']);
 });
});
