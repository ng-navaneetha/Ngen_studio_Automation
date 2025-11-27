pipeline {
    agent any

    triggers {
        cron('30 8 * * *')   // Daily at 8:30 AM
    }

    tools {
        nodejs "node18"
    }

    environment {
        TEAMS_WEBHOOK_URL = credentials('TEAMS_WEBHOOK')  // Create Jenkins Credential ID = TEAMS_WEBHOOK
    }

    stages {

        stage('Checkout Repo') {
            steps { git branch: 'main', url: 'https://github.com/ng-navaneetha/Ngen_studio_Automation.git' }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                sh 'npx playwright test --grep @smoke --reporter=json,html'
            }
        }

        stage('Publish Report') {
            steps {
                publishHTML(target: [
                    reportDir: "playwright-report",
                    reportFiles: "index.html",
                    reportName: "Playwright Report",
                    alwaysLinkToLastBuild: true,
                    keepAll: true
                ])
            }
        }

        /* ============ ADAPTIVE CARD MESSAGE BUILDER ============ */
        stage("Prepare Teams Adaptive Card") {
            steps {
                script {
                    def json = readJSON file: "results.json"

                    int total   = json.suites[0].tests.size()
                    int passed  = json.suites[0].tests.count { it.status == "passed" }
                    int failed  = json.suites[0].tests.count { it.status == "failed" }
                    int skipped = json.suites[0].tests.count { it.status == "skipped" }
                    int flaky   = json.suites[0].tests.count { it.status == "flaky" }
                    double duration = (json.stats.duration/1000/60).round(2)

                    def rows = json.suites[0].tests.collect { t ->
                        def color = ["passed":"good","failed":"attention","flaky":"warning","skipped":"default"][t.status] ?: "default"
                        return """{
                            "type": "ColumnSet",
                            "columns": [
                                { "type": "Column","width":"stretch","items":[{ "type": "TextBlock","text": "${t.title}","wrap": true }]},
                                { "type": "Column","width":"auto","items":[{ "type": "TextBlock","text": "${t.status.toUpperCase()}","color": "${color}","weight": "Bolder"}]}
                            ]
                        }"""
                    }.join(",")

                    env.ADAPTIVE_CARD = """
                    {
                      "type": "message",
                      "attachments": [{
                        "contentType": "application/vnd.microsoft.card.adaptive",
                        "content": {
                          "type": "AdaptiveCard",
                          "version": "1.4",
                          "body": [
                            { "type": "TextBlock","size":"Large","weight":"Bolder","text":"🚀 Playwright Automation Report" },
                            { "type": "FactSet","facts":[
                                {"title":"Total","value":"${total}" },
                                {"title":"Passed","value":"${passed}" },
                                {"title":"Failed","value":"${failed}" },
                                {"title":"Flaky","value":"${flaky}" },
                                {"title":"Skipped","value":"${skipped}" },
                                {"title":"Duration","value":"${duration} mins" }
                            ]},
                            { "type":"TextBlock","weight":"Bolder","text":"📋 Test Execution Result", "spacing":"Medium" },
                            ${rows}
                          ],
                          "actions": [{
                              "type": "Action.OpenUrl",
                              "title": "🔗 View HTML Report",
                              "url": "${env.BUILD_URL}playwright-report/index.html"
                          }]
                        }
                      }]
                    }
                    """
                }
            }
        }

        /* ================== SEND TO TEAMS ================== */
        stage("Notify Teams Adaptive") {
            steps {
                sh """
                curl -H "Content-Type: application/json" \
                -d '${env.ADAPTIVE_CARD.replace("'","\\'")}' \
                ${TEAMS_WEBHOOK_URL}
                """
            }
        }
    }
}
