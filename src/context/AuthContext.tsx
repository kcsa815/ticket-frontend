/*  /src/contexts는 인증(Auth)에 관련된 모든 정보(토큰, 로그인/로그아운 기능)를 담아두는
    전역보관함(context)임   
 */
import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

 

//1. Context에 저장할 값들의 타입 정의
interface AuthContextType{
    token :string | null;       //JWT 토큰
    isLoggedIn : boolean;       // 로그인 여부(true/ false)
    login: (token:string) => void;      //로그인함수(토큰을 받아서 저장)
    logout: () =>void;          //로그아웃 함수
}

//2. Context생성(초기값은 undefined)
export const AuthContext = createContext <AuthContextType | undefined>(undefined);


//3. Context를 제공하는 "Provider" 컴포넌트 생성
// 이 컴포넌트가 앱 전체를 감싸면서 'value'를 제공함
export function AuthProvider({children} : {children : ReactNode}){
    const [token, setToken] = useState<string | null>(null);

    // 앱이 처음 로드될 때, localStorage에서 토큰을 읽어옴
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if(storedToken){
             setToken(storedToken);
             // axios 기본 헤더에도 즉시 설정
            axios.defaults.headers.common['Authorization'] = 'Bearer ${storedToken}';
        }       
    }, []);   // 앱(Provider)이 처음 마운트될 때 1회 실행

    // 로그인 함수 : 토큰을 받아 status와 localStorage에 저장
    const login = (newToken: string) =>{
        setToken(newToken);
        axios.defaults.headers.common['Authorization'] = 'Bearer ${newToken}';
        localStorage.setItem('token', newToken);   // 브라우저에 영구 저장
    };

    // 로그아웃 함수 : status와 localStorage에서 토큰 제거
    const logout = () =>{
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');  //브라우저에서 제거
    };

    // Context가 제공할 값들을 객체로 묶음
    const value = {
        token,
        isLoggedIn: !!token,   //token이 있으면 true, 없으면 false
        login,
        logout
    };


    //4. 자식 컴포넌트들(children)에게 value를 제공
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

//5. (편의기능) Context를 쉽게 사용하기 위한 Custom Hook
//이 Hook를 사용하면 useContext(AuthContext)를 매번 쓸 필요가 없음
export function useAuth(){
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuth는 AuthProvider안에서 사용해야 합니다.');
    }    
    return context;
}

