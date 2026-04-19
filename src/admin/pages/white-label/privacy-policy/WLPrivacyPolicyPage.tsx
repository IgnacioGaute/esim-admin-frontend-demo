import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { useWhiteLabelFetch } from '@/admin/hooks/useWhiteLabelFetch';

export const WLPrivacyPolicyPage = () => {
  const { dataWhiteLabel, onSaveWhiteLabel, loading } = useWhiteLabelFetch();

  const onSaveData = async(privacy_policy:string) => {
    await onSaveWhiteLabel({privacy_policy});
  }
  
  return (
    <RichTextEditor 
      isRequired
      value={dataWhiteLabel?.privacy_policy || undefined}
      onValueEditor={onSaveData}
      loading={loading}
      configEditor={{
        toolbar: "mytoolbar",
        toolbar_mytoolbar:"{bold,italic}|{fontsize}|{forecolor,backcolor}|{justifyleft,justifycenter,justifyright,justifyfull}|{indent,outdent}|{insertorderedlist,insertunorderedlist}"+ "#{undo,redo,fullscreenenter,fullscreenexit}"
      }}
    />
  )
}
