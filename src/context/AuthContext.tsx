/*  /src/contexts는 인증(Auth)에 관련된 모든 정보(토큰, 로그인/로그아운 기능)를 담아두는
    전역보관함(context)임   
 */
import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
 
interface JwtPayload{
    sub: string;    //이메일
    auth: string;   //권한("ROLE_USER, ROLE_ADMIN")
    exp: number;    //만료시간
}


//1. Context에 저장할 값들의 타입 정의
interface AuthContextType{
    token :string | null;       //JWT 토큰
    isLoggedIn : boolean;       // 로그인 여부(true/ false)
    isLoading: boolean;        //지금 토큰 확인 중인지?
    userRole: string | null;    // "ROLE_USER", "ROLE_ADMIN"
    login: (token:string) => void;      //로그인함수(토큰을 받아서 저장)
    logout: () =>void;          //로그아웃 함수
}

//2. Context생성(초기값은 undefined)
export const AuthContext = createContext <AuthContextType | undefined>(undefined);


//3. Context를 제공하는 "Provider" 컴포넌트 생성
export function AuthProvider({children} : {children : ReactNode}){
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);    // isLoading state 선언 (초기값 true)
    const   [userRole, setUserRole] = useState<string | null>(null);

    // [수정 2] useEffect를 try...finally로 감싸기
    useEffect(() => {
        try {
            // (1) 앱이 처음 로드될 때 (새로고침 시) localStorage를 읽음
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                const decode = jwtDecode<JwtPayload>(storedToken);

                //토큰이 만료되지 않았는지 확인
                if(decode.exp * 1000 > Date.now()){
                    setToken(storedToken);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                    //해독한 권한(auth)을 state에 저장
                    //백엔드가 권한을 1개만 보낸다고 가정.
                    setUserRole(decode.auth.split(',')[0]);
                } else{
                    //토큰이 만료됨
                    localStorage.removeItem('token');
                }
            }
        } catch (error) {
            console.error("토큰 로딩 또는 해독 실패:", error);
            localStorage.removeItem('token');
        } finally {
            //(중요!) 토큰 확인 작업이 (성공하든 실패하든) '끝났음'을 알림
            setIsLoading(false);
        }
    }, []); // [] : 앱(Provider)이 처음 마운트될 때 1회 실행

    // 로그인 함수 : 토큰을 받아 status와 localStorage에 저장
    const login = (newToken: string) =>{
        try{
            //로그인 시에도 토큰 해독 및 권한 저장
            const decode = jwtDecode<JwtPayload>(newToken);
            setToken(newToken);
            setUserRole(decode.auth.split(',')[0]); //권한 저장
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            localStorage.setItem('token', newToken);

        } catch(error){
            console.error("로그인 토큰 해독 실패:", error);
        }
    };

    // 로그아웃 함수 : status와 localStorage에서 토큰 제거
    const logout = () =>{
        setToken(null);
        setUserRole(null);  //권한 초기화
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');  //브라우저에서 제거
    };

    // Context가 제공할 값들을 객체로 묶음
    const value = {
        token,
        isLoggedIn: !!token,   //token이 있으면 true, 없으면 false
        isLoading,
        userRole,
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

