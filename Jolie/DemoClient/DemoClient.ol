include "console.iol"
include "file.iol"

type SumReqType: void { .x: string }
type SumResType: void { .message: int }

outputPort WebId {
	Location: "socket://localhost:8000"
	Protocol: sodep
	RequestResponse: login( SumReqType )( undefined )
}

main
{
  file.filename = "webid.pem";		
  readFile@File( file )( s );
    login@WebId( {.x = s} )( res );
    if ( res.profile.mess =="OK" ) {
	println@Console( "\n Benvenuto "+ res.profile.name )();
	println@Console( "Questo è il tuo WebId: \n" + res.profile.webid + "\n" )();
	println@Console( "Queste sono le persone che conosci :" )();
	for ( i = 0, i < #res.profile.knows, i++ ) {
		println@Console("-" + res.profile.knows[i] )()
        }

    } else {
	println@Console( res.profile.mess )()
    }

}
