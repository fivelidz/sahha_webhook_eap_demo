'use client';

import { useSahhaProfiles } from '@/contexts/SahhaDataContext';
import { useEffect } from 'react';

export default function TestPage() {
  const { profiles, assignments, loadDemoData } = useSahhaProfiles();
  
  useEffect(() => {
    console.log('TEST PAGE: Profiles count:', profiles.length);
    console.log('TEST PAGE: Assignments count:', Object.keys(assignments).length);
    
    if (profiles.length === 0) {
      console.log('TEST PAGE: No profiles found, loading demo data...');
      loadDemoData();
    } else {
      console.log('TEST PAGE: First 5 profiles:', profiles.slice(0, 5).map(p => ({
        id: p.profileId,
        dept: p.department,
        assigned: p.assignedDepartment
      })));
    }
  }, [profiles]);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Context Test Page</h1>
      <p>Open browser console to see debug output</p>
      <hr />
      <h2>Profiles: {profiles.length}</h2>
      <h2>Assignments: {Object.keys(assignments).length}</h2>
      <hr />
      <h3>First 10 Profiles:</h3>
      <pre>
        {JSON.stringify(profiles.slice(0, 10).map(p => ({
          id: p.profileId,
          dept: p.department,
          assignedDept: p.assignedDepartment
        })), null, 2)}
      </pre>
      <hr />
      <h3>First 10 Assignments:</h3>
      <pre>
        {JSON.stringify(Object.entries(assignments).slice(0, 10), null, 2)}
      </pre>
    </div>
  );
}