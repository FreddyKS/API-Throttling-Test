async function fetchMultipleUrls() {
    //Retrieve variables
    var loop = document.getElementById('loop').value;
    var url_list = document.getElementById('url_list').value.split("\n");
    var method = document.getElementById('method').value;
    //var token = document.getElementById('bearer').value;
    var token = document.getElementById('bearer').value.split("\n");
    //https://chatgpt.com/share/8a0a8009-6292-4165-bac9-92c8e9ec87d5
    
    //Split json filled inputs by } (any whitespaces between) {, without removing } and {
    //https://medium.com/@shemar.gordon32/how-to-split-and-keep-the-delimiter-s-d433fb697c65
    
    var postfield_get = document.getElementById('post_field').value.split(/(?<=[}])\s*(?=[{])/g);
    
    //var postfield = document.getElementById('post_field').value;
    var content = "application/json";
    
    //Test the app here
    

    //End of testing

    //Disable the button
    document.getElementById('print').disabled = true;

    //Empties the result
    document.getElementById('output').innerHTML = '';
    
    if(!document.getElementById('url_list').value){
        document.getElementById('fetch-loading').style.visibility='visible';
        document.getElementById('fetch-loading').style.backgroundColor='red';
        document.getElementById('fetch-loading').style.color='white';
        var display_loading = '`API list` cannot be empty';
        document.getElementById('complete').innerHTML=display_loading;
        //Re enable the button on error
        document.getElementById('print').disabled = false;
        return;
    }
    else if(url_list.length>1 && token.length>1){
        if(url_list.length!=token.length){
            document.getElementById('fetch-loading').style.visibility='visible';
            document.getElementById('fetch-loading').style.backgroundColor='red';
            document.getElementById('fetch-loading').style.color='white';
            var display_loading = 'TOKEN NOT EMPTY\n `Bearer` lines have to be the same as `API list`';
            document.getElementById('complete').innerHTML=display_loading;
            //Re enable the button on error
            document.getElementById('print').disabled = false;
            return;
        }
    }
    else if(url_list.length>1 && postfield_get.length>1){
        if(url_list.length!=postfield_get.length){
            document.getElementById('fetch-loading').style.visibility='visible';
            document.getElementById('fetch-loading').style.backgroundColor='red';
            document.getElementById('fetch-loading').style.color='white';
            var display_loading = 'MULTIPLE POSTFIELD NOT EMPTY\n `POST FIELD` lines have to be the same as `API list`';
            document.getElementById('complete').innerHTML=display_loading;
            //Re enable the button on error
            document.getElementById('print').disabled = false;
            return;
        }
    }
    else{
        document.getElementById('fetch-loading').style.visibility='visible';
        document.getElementById('fetch-loading').style.backgroundColor='#69ff9b9e';
        document.getElementById('fetch-loading').style.color='black';
    }
    //Loading starts
    let startTime = new Date();
    var display_loading = 'Fetching ' + parseInt(loop)*parseInt(url_list.length) + ' request';
    document.getElementById('complete').innerHTML=display_loading;
    document.getElementById('loading').style.display='block';
    
    const urls = [];

    if(!loop || loop<1){
        loop='1';
    }
    if(!method){
        method='GET';
    }
    if(!content){
        content='application/json';
    }
    
    for(var i=0;i<url_list.length; i++){
        for(let j=0;j<loop;j++){
            var url_inside = [];
            url_inside['url']=url_list[i];
            url_inside['bearer']=token[i];
            if(method!='GET'){
                url_inside['postfield']=postfield_get[i];
            }
            urls.push(url_inside);
            /*
            Multiple bearers and postfields is currently not supported
            if(token.length>1){
                bearers.push(token[i]);
            }
            if(method!='GET'){
                postfield.push(postfield_get[i]);
            }
            */
        }
    }
    console.log(urls);
    let afterLoop = new Date();
    let timeLoop = (afterLoop-startTime)/1000;
    console.log('urls.push duration : '+timeLoop+' s');
    try {
        //If GET, don't send body
        if(method=='GET'){
            // Run these requests in parallel using Promise.all
                const responses = await Promise.all(
                    urls.map(url => 
                        fetch(url.url, {
                            method: `${method}`,
                            headers: {
                                'Authorization': `Bearer ${url.bearer}`,
                                'Content-Type': `${content}`
                            }
                        })
                    )
                );
            
            // Parse all responses to JSON
            const data = await Promise.all(
                responses.map(async response => {
                    if (response && response.ok) {  
                        // Check if the response is JSON
                        return response.json(); 
                    } 
                    else if (response) {
                        const response_real = response.clone();
                        try{
                            return await response_real.json();  // Handle non-OK status
                        }catch(error){
                            return await response.text();
                        }
                    }
                    else{
                        return "(Response from Parallel-API-Request-Tester) => Response unavailable";
                    }
                })
            );
            
            // Display in file for further analysis
            var data_str="";
            data.forEach(item => {
                document.getElementById('output').textContent += `${JSON.stringify(item, item, 2)}`;
            });
            
            //Loading Complete
            let endTime = new Date();
            let timeElapsed = (endTime - startTime)/1000;
            document.getElementById('complete').innerHTML=loop+' parallel `'+method+'` request on '+'`'+document.getElementById('url_list').value+'` done in <br>'+timeElapsed + ' seconds';
            document.getElementById('loading').style.display='none';
            
        
            //Re enable the button
            document.getElementById('print').disabled = false;
        }
        else{
            // Run these requests in parallel using Promise.all
            const responses = await Promise.all(
                urls.map(url => 
                    fetch(url.url, {
                        method: `${method}`,
                        headers: {
                            'Authorization': `Bearer ${url.bearer}`,
                            'Content-Type': `${content}`
                        },
                        body: url.postfield
                    })
                )
            );

            // Parse all responses to JSON
            const data = await Promise.all(
                responses.map(async response => {
                    if (response && response.ok) {  
                        // Check if the response is JSON
                        return await response.json(); 
                    } 
                    else if (response) {
                        const response_real = response.clone();
                        try{
                            return await response_real.json();  // Handle non-OK status
                        }catch(error){
                            return await response.text();
                        }
                    }
                    else{
                        return "(Response from Parallel-API-Request-Tester) => Response unavailable";
                    }
                })
            );

            // Display in file for further analysis
            var data_str="";
            data.forEach(item => {
            document.getElementById('output').textContent += `${JSON.stringify(item, item, 2)}`;
            });

            //Loading Complete
            let endTime = new Date();
            let timeElapsed = (endTime - startTime)/1000;
            document.getElementById('complete').innerHTML='`'+document.getElementById('url_list').value+'` done in <br>'+timeElapsed + ' seconds';
            document.getElementById('loading').style.display='none';


            //Re enable the button
            document.getElementById('print').disabled = false;
        }

    } catch (error) {
        document.getElementById('fetch-loading').style.visibility='visible';
        document.getElementById('fetch-loading').style.backgroundColor='red';
        document.getElementById('fetch-loading').style.color='white';
        document.getElementById('loading').style.display='none';
        document.getElementById('complete').innerHTML='Invalid API `'+document.getElementById('url_list').value+'`<br>Error Detail -> `'+error+'`';
        //Re enable the button on error
        document.getElementById('print').disabled = false;
        return;
    }
}

function changeColor(){
    var method = document.getElementById('method').value;
    if(method=='GET'){
        document.getElementById('method').className='getmethod';
    }
    else if(method=='POST'){
        document.getElementById('method').className='postmethod';
    }
    else if(method=='PUT' || method=='PATCH'){
        document.getElementById('method').className='updatemethod';
    }
    else{
        document.getElementById('method').className='deletemethod';
    }
}

function displayDanger(){
    var loop = document.getElementById('loop').value;
    if(loop>50){
        document.getElementById('danger_parallel').style.visibility='visible';
    }
    else{
        document.getElementById('danger_parallel').style.visibility='hidden';
    }
}