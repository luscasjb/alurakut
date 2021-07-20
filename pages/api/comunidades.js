import { SiteClient } from 'datocms-client';

export default async function recebedorDeRequests (request, response) {
    if (request.metod === 'POST') {
        const TOKEN = '550b58368c05b5ae3a86db52e1c72a';
        const client = new SiteClient(TOKEN);

        const registroCriado = await client.items.create({
            itemType: "979320",
            ...request.body,
            
            //title: "Blockchain",
            //imageUrl: "https://bropenbadge.com/wp-content/uploads/2019/10/Afinal-o-que-%C3%A9-Blockchain-1170x640.jpg",
            //creatorSlug: "luscasjb" 
        })

        response.json({
            dados: 'Algum dado qualquer',
            registroCriado: registroCriado,
        })
        return;
    }

    response.status(404).json({
        message: 'Ainda não temos nada no GET, mas no POST tem!'
    })
}
    
