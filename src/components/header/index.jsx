import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Flex } from 'antd'
import { useAuth } from '../../contexts/authContext'
import { doSignOut } from '../../firebase/auth'

const Header = () => {
    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()
    return (
        <nav className='flex flex-row gap-x-2 w-full z-20 fixed top-0 left-0 h-12 border-b place-content-center items-center bg-gray-200'>
            {
                userLoggedIn
                    ?
                    <>
                    <Flex>
                        <Button 
                            type="link" 
                            size="small" 
                            style={{ 
                                color: 'blue', 
                                textDecoration: 'underline', 
                                top: '10px', 
                                right: '10px',
                                padding: '0',
                                margin:'0' 
                            }} 
                            onClick={() => { 
                                doSignOut().then(() => { 
                                    navigate('/login') 
                                }) 
                            }}
                        >
                            Logout
                        </Button>
                    </Flex>
                    </>
                    :
                    <>
                        <Link className='text-sm text-blue-600 underline' to={'/login'}>Login</Link>
                        <Link className='text-sm text-blue-600 underline' to={'/register'}>Register New Account</Link>
                    </>
            }
        </nav>
    )
}

export default Header
