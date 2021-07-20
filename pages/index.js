import React from 'react'
import nookies from 'nookies'
import jwt from 'jsonwebtoken'
import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from  '../src/lib/AlurakutCommons'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations'

function ProfileSidebar (propriedades) {
  return (
    <Box as="aside">
      <img src= {`https://github.com/${propriedades.gitUser}.png`} style= {{ borderRadius: '8px' }} />
      <hr />    

      <p>
        <a className="boxLink" href={`https://github.com/${propriedades.gitUser}`}>
        @{propriedades.gitUser}
        </a>
      </p>
      <hr />

      <AlurakutProfileSidebarMenuDefault />
    </Box>
  )
}

function ProfileRelationsBox(propriedades){
  return(
    <ProfileRelationsBoxWrapper>
    <h2 className= "smallTitle">
       {propriedades.title} ({propriedades.items.length})
    </h2>
     <ul>
       {/* seguidores.map((itemAtual) => {
         return ( 
           <li key={itemAtual}>
             <a href={`https://github.com/${itemAtual}.png`}>
               <img src={itemAtual.image} />
               <span>{itemAtual.title}</span>
             </a>
           </li>
         )
       })} */}
     </ul>
   </ProfileRelationsBoxWrapper>
  )
}

export default function Home(props) {
  const usuario = props.githubUser;
  const [comunidades, setComunidades] = React.useState([{
    id: '21313',
    title: 'Eu odeio acordar cedo',
    image: 'https://alurakut.vercel.app/capa-comunidade-01.jpg'
  }]); 
  const favoritos = [
    'EmersonAscari',
    'KingTavish',
    'omariosouto', 
    'juunegreiros', 
    'peas'
  ]
  const [seguidores, setSeguidores] = React.useState ([]);

  React.useEffect(function(){
    fetch('https://api.github.com/users/luscasjb/followers')
    .then(function(respostaDoServidor) {
      return respostaDoServidor.json();
    })
    .then(function(respostaCompleta){
      setSeguidores(respostaCompleta);
    })

    //API GraphQL
    fetch ('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': '7323600bd6541e13cb0fadecb0920b',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }, 
      body: JSON.stringify({ "query": `query {
        allCommunities {
          id
          title
          imageUrl
          creatorSlug
        }
      }` })
    })
    .then ((response) => response.json())
    .then ((respostaCompleta) => {
      const comunidadesDato = respostaCompleta.data.allCommunities;
      setComunidades(comunidadesDato)
    })
  }, [])

  return (
    <>
      <AlurakutMenu />
      <MainGrid>
        <div className= "profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSidebar gitUser={usuario} />
        </div>
        <div className= "welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className= "Title"> 
              Bem Vindo(a)
            </h1>

            <OrkutNostalgicIconSet />
          </Box>

          <Box>
            <h2 className="subTitle">Crie sua comunidade</h2>
            <form onSubmit={function handleCriarComunidade(e) {
                e.preventDefault();  
                const dadosDoForm = new FormData(e.target);

                const comunidade = {
                  id: new Date().toISOString(),
                  title: dadosDoForm.get('title'),
                  imageUrl: dadosDoForm.get('image'),
                  creatorSlug: usuario,
                }

                fetch ('/api/comunidades', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(comunidade) 
                })
                .then(async (response) => {
                  const dados = await response.json();
                  const comunidade = dados.registroCriado;
                  const comunidadesAtualizadas = [...comunidades, comunidade];
                  setComunidades (comunidadesAtualizadas);
                })   
            }}>
              <div>
                <input 
                  placeholder="Nome da comunidade" 
                  name="title" 
                  arial-label="Nome da comunidade" 
                  type="text"
                />
              </div>
              <div>
                <input 
                  placeholder="URL de capa" 
                  name="image" 
                  arial-label="URL de capa" 
                />
              </div>
              <button>
                Criar comunidade
              </button>
            </form> 
          </Box>
        </div>
        <div className= "profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
        <ProfileRelationsBox title="Seguidores" items={seguidores} />
          <ProfileRelationsBoxWrapper>
           <h2 className= "smallTitle">
              Favoritos ({favoritos.length})
            </h2>
            <ul>
              {favoritos.map((itemAtual) => {
                return ( 
                  <li key={itemAtual}>
                    <a href={`/users/${itemAtual}`}>
                      <img src={`https://github.com/${itemAtual}.png`} />
                      <span>{itemAtual}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
          <h2 className= "smallTitle">
              Comunidades ({comunidades.length})
            </h2>
            <ul>
              {comunidades.map((itemAtual) => {
                return ( 
                  <li key={itemAtual.id} >
                    <a href={`/communities/${itemAtual.id}`}>
                      <img src={itemAtual.imageUrl} />
                      <span>{itemAtual.title}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
        </div>
      </MainGrid>
    </>
  )
}

  export async function getServerSideProps(context) {
    const cookies =  nookies.get(context)
    const token = cookies.USER_TOKEN;    
    const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
      headers: {
        Authorization: token
      }
    })
    .then((resposta) => resposta.json())

    if(!isAuthenticated) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        }
      }
    }

    const { githubUser } = jwt.decode(token);
    return{
      props: {
        githubUser
      }, 
    }
  }