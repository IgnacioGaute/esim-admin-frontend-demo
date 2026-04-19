
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { useWhiteLabelFetch } from '@/admin/hooks/useWhiteLabelFetch';

export const WLTermsConditionsPage = () => {
  const { dataWhiteLabel, onSaveWhiteLabel, loading } = useWhiteLabelFetch();

  const onSaveData = async(terms_and_conditions:string) => {
    await onSaveWhiteLabel({terms_and_conditions});
  }

  return (
    <RichTextEditor 
      isRequired
      value={dataWhiteLabel?.terms_and_conditions || undefined}
      onValueEditor={onSaveData}
      loading={loading}
      configEditor={{
        toolbar: "mytoolbar",
        toolbar_mytoolbar:"{bold,italic}|{fontsize}|{forecolor,backcolor}|{justifyleft,justifycenter,justifyright,justifyfull}|{indent,outdent}|{insertorderedlist,insertunorderedlist}"+ "#{undo,redo,fullscreenenter,fullscreenexit}"
      }}
    />
  );
}
