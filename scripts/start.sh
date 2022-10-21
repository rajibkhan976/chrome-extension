 #!/bin/bash

build() {
    cp public/kyubiSettings.json src/kyubiSettings.json
    
    react-scripts start

}

build