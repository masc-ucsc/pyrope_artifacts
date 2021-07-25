
*** WARNING: This PEGJS grammar is for an older version of Pyrope 0.2. It is not consistent with LiveHD ***

# build
```
yarn install
yarn build
```


# Setup

```
npm install
npm run-script build
```

# Usage for prpfmt
	cd ./bin
    ./prpfmt [input_file]
    
## Example (test7.prp)

	cd ./bin
    ./prpfmt ../tests/fmt/inputs/test7.prp
    
Before prpfmt:

    b=::{}
    
    
    b=:(x y):{   }
    
    
    b=::{  a=1}
    
    
    b=:(x y ):{a=1
    d=1}
    
    
    b = :(x y z):{
    a=1
    b=1
    j=::{k=::{}
    c=1
    d=1
    }
    l=::{}
    }




After prpfmt:

    b = ::{}
    b = :(x y):{}
    b = ::{ a = 0d1}
    b = :(x y):{
    	a = 0d1
        d = 0d1
    }
    b = :(x y z):{
    	a = 0d1
        b = 0d1
        j = ::{
        	k = ::{}
            c = 0d1
            d = 0d1
        }
    	l = ::{}
    }



# Known issue
Current parser cannot parse comment and operator by(in test12.prp) and it will throw an exception(peg\$SyntaxError). And this formatter would not work if parser cannnot generate AST correctly. To pass tests you need to delete comments manually or by following command:

	find . -name "*.prp" | xargs -I {} sed -i 's/^#[^\S]*//' {}
