pipeline {
     agent { label 'webapp-back-001-prod.local.rk-env.ru' }

    stages {
        stage('Build') {
            steps {
                        echo  scm.branches[0].name
                        sh "cp /questionnaire_validation/.env /home/jenkins/.env"
                        sh "sudo rm -rf /questionnaire_validation/"
                        sh "sudo mkdir /questionnaire_validation/"
                        sh "sudo cp -R ./* /questionnaire_validation/"
                        sh "sudo cp /home/jenkins/.env /questionnaire_validation/.env"
                        sh "sudo killall -9 node 2>/dev/null || true"
                        
                   }
                   
            } 
        stage('Run') {
        steps {
            dir('/questionnaire_validation'){
            
                        sh "sudo npm install"
                        sh "sudo npm run build"
                        sh "sudo npm run start &" 
            }   
            }
        }     
    }
}