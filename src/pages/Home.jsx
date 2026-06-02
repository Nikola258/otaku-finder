import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';

function Home() {

  const fetch = async () => {
     let { data, error } = await supabase
  .from('test')
  .select('*');
  console.log(data);



  }
  fetch();

  return <div>Home</div>;
}

export default Home;