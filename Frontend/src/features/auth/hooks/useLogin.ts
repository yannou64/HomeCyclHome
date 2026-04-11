  import { useState } from 'react';                                                                                                                                                                                                                                                                                                                                                 
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../../../app/providers/authContext/useAuth';                                                                                                                                                                                                                                                                                                             
  import { login as loginService } from '../services/authService';                                                                                                                                                                                                                                                                                                                  
  import type { LoginPayload } from '../types/auth.types';
  
  const isDev = import.meta.env.DEV                                                                                                                                                                                                                                                                                                                                        
  
  export function useLogin() {                                                                                                                                                                                                                                                                                                                                                      
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);                                                                                                                                                                                                                                                                                                                      
      const { login } = useAuth();
      const navigate = useNavigate();       
                                          
      async function handleLogin(payload: LoginPayload) {
        if(isDev) console.log('[useLogin] tentative de login : ', payload.email)
        setIsLoading(true);                                                                                                                                                                                                                                                                                                                                                       
          setError(null);
                                                                                                                                                                                                                                                                                                                                                                                    
          try {   
              const session = await loginService(payload);
              login(session);      
              if(isDev) console.log("[useLogin] session créé, redirection")     // met à jour le contexte + localStorage
              navigate('/');            // redirige vers l'accueil
          } catch(e) {      
              console.error('[useLogin] échec login : ', e)                     
              setError('Email ou mot de passe incorrect.');                                                                                                                                                                                                                                                                                                                         
          } finally {
              setIsLoading(false);      // toujours exécuté, succès ou échec                                                                                                                                                                                                                                                                                                        
          }                                   
      }                                                                                                                                                                                                                                                                                                                                                                             
                  
      return { handleLogin, isLoading, error };                                                                                                                                                                                                                                                                                                                                     
  }